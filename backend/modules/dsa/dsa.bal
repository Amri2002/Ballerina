import ballerina/http;
import ballerinax/mongodb;
import ballerina/log;

const string DATABASE = "learning_platform";
const string COLLECTION = "dsa_user_progress";

// Progress tracking: mark DSA module completed
public function dsa_progress_mark_completed(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
	string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
	if (authHeader is string && authHeader.startsWith("Bearer ")) {
		string token = authHeader.substring(7, authHeader.length());
		map<anydata>? userMapOpt = sessionStore[token];
		if userMapOpt is map<anydata> {
			string userId = <string>userMapOpt["id"];
			json|error payloadOrError = req.getJsonPayload();
			if (payloadOrError is error) {
				return createResponse(400, "Invalid JSON", "Invalid JSON payload");
			}
			json payload = payloadOrError;
			string moduleId = "";
			json|error moduleIdField = payload.moduleId;
			if (moduleIdField is string) {
				moduleId = moduleIdField;
			}
			if (moduleId == "") {
				return createResponse(400, "Missing moduleId", "Required field missing");
			}
			// Query MongoDB for previous completed modules
			mongodb:Database|error dbResult = mongoClient->getDatabase(DATABASE);
			if (dbResult is error) {
				return createResponse(500, "Database connection failed", dbResult.message());
			}
			mongodb:Database db = dbResult;
			mongodb:Collection|error collectionResult = db->getCollection(COLLECTION);
			if (collectionResult is error) {
				return createResponse(500, "Collection access failed", collectionResult.message());
			}
			mongodb:Collection progressCollection = collectionResult;
			map<json> filter = { userId: userId };
			stream<record {}, error?>|error findResult = progressCollection->find(filter);
			if (findResult is error) {
				return createResponse(500, "Database query failed", findResult.message());
			}
			stream<record {}, error?> resultStream = findResult;
			record {}[] data = [];
			error? forEachResult = resultStream.forEach(function(record {} value) {
				data.push(value);
			});
			if (forEachResult is error) {
				return createResponse(500, "Data processing failed", forEachResult.message());
			}
			string[] completedModules;
			if (data.length() == 0) {
				completedModules = [moduleId];
			} else {
				map<anydata> progressMap = <map<anydata>>data[0];
				anydata[] completedModulesAny = [];
				if progressMap.hasKey("completedModules") {
					anydata completedRaw = progressMap["completedModules"];
					if (completedRaw is anydata[]) {
						completedModulesAny = completedRaw;
					}
				}
				completedModules = [];
				foreach var module in completedModulesAny {
					if (module is string) {
						completedModules.push(module);
					}
				}
				boolean alreadyCompleted = false;
				foreach var completedModule in completedModules {
					if (completedModule == moduleId) {
						alreadyCompleted = true;
						break;
					}
				}
				if (!alreadyCompleted) {
					completedModules.push(moduleId);
				}
			}
			// Workaround: Use Express microservice for DSA progress update
			http:Client|error clientOrError = new("http://localhost:4003");
			if (clientOrError is http:Client) {
				json dsaPayload = {"userId": userId, "completedModules": completedModules, "dsa": true};
				http:Response|error respOrError = clientOrError->post("/update-dsa-progress", dsaPayload);
				if (respOrError is http:Response) {
					json|error respJson = respOrError.getJsonPayload();
					if (respJson is json) {
						log:printInfo("DSA Progress microservice response: " + respJson.toString());
						return createResponse(200, "{\"message\": \"Progress updated successfully\", \"moduleId\": \"" + moduleId + "\"}", null);
					} else {
						log:printError("DSA Progress microservice error: " + respJson.message());
						return createResponse(500, "Microservice error", respJson.message());
					}
				} else {
					log:printError("DSA Progress microservice HTTP error: " + respOrError.message());
					return createResponse(500, "Microservice HTTP error", respOrError.message());
				}
			} else {
				log:printError("Failed to create HTTP client: " + clientOrError.message());
				return createResponse(500, "Failed to create HTTP client", clientOrError.message());
			}
		} else {
			return createResponse(401, "Invalid token", "Session not found");
		}
	} else {
		return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
	}
}

// Progress tracking: get DSA user progress
public function get_dsa_user_progress(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
	string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
	if (authHeader is string && authHeader.startsWith("Bearer ")) {
		string token = authHeader.substring(7, authHeader.length());
		map<anydata>? userMapOpt = sessionStore[token];
		if userMapOpt is map<anydata> {
			anydata userIdRaw = userMapOpt["id"];
			if (userIdRaw is string) {
				string userId = userIdRaw;
				mongodb:Database|error dbResult = mongoClient->getDatabase(DATABASE);
				if (dbResult is error) {
					return createResponse(500, "Database connection failed", dbResult.message());
				}
				mongodb:Database db = dbResult;
				mongodb:Collection|error collectionResult = db->getCollection(COLLECTION);
				if (collectionResult is error) {
					return createResponse(500, "Collection access failed", collectionResult.message());
				}
				mongodb:Collection progressCollection = collectionResult;
				map<json> filter = { userId: userId };
				stream<record {}, error?>|error findResult = progressCollection->find(filter);
				if (findResult is error) {
					return createResponse(500, "Database query failed", findResult.message());
				}
				stream<record {}, error?> resultStream = findResult;
				record {}[] data = [];
				error? forEachResult = resultStream.forEach(function(record {} value) {
					data.push(value);
				});
				if (forEachResult is error) {
					return createResponse(500, "Data processing failed", forEachResult.message());
				}
				if (data.length() == 0) {
					return createResponse(200, "{\"completedModules\": [], \"userId\": \"" + userId + "\"}", null);
				} else {
					map<anydata> progressMap = <map<anydata>>data[0];
					return createResponse(200, progressMap.toString(), null);
				}
			} else {
				return createResponse(401, "Invalid token", "User ID not found in session");
			}
		} else {
			return createResponse(401, "Invalid token", "Session not found");
		}
	} else {
		return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
	}
}

// Helper: create standardized responses
function createResponse(int statusCode, string payload, string? errorMessage) returns http:Response {
	http:Response res = new();
	res.statusCode = statusCode;
	if (errorMessage is string) {
		res.setPayload("{\"error\": \"" + errorMessage + "\", \"message\": \"" + payload + "\"}");
	} else {
		res.setPayload(payload);
	}
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.setHeader("Content-Type", "application/json");
	return res;
}
