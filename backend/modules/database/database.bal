import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;

// Progress tracking: mark module completed
public function user_progress_mark_completed(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
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
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("user_progress");
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
                record {| string userId; string[] completedModules; string lastUpdated; |} progressDoc = {
                    userId: userId,
                    completedModules: [moduleId],
                    lastUpdated: time:utcNow().toString()
                };
                error? insertResult = progressCollection->insertOne(progressDoc);
                if (insertResult is error) {
                    return createResponse(500, "Failed to create progress record", insertResult.message());
                }
            } else {
                map<anydata> progressMap = <map<anydata>>data[0];
                anydata[] completedModulesAny = [];
                if progressMap.hasKey("completedModules") {
                    anydata completedRaw = progressMap["completedModules"];
                    if (completedRaw is anydata[]) {
                        completedModulesAny = completedRaw;
                    }
                }
                string[] completedModules = [];
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
                    map<json> updateFilter = { userId: userId };
                    map<json> updateFields = {
                        completedModules: completedModules,
                        lastUpdated: time:utcNow().toString()
                    };
                    mongodb:Update updateDoc = { "$set": updateFields };
                    var updateResult = progressCollection->updateOne(updateFilter, updateDoc);
                    if (updateResult is error) {
                        return createResponse(500, "Failed to update progress", updateResult.message());
                    }
                }
            }
            return createResponse(200, "{\"message\": \"Progress updated successfully\", \"moduleId\": \"" + moduleId + "\"}", ());
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Progress tracking: get user progress
public function get_user_progress(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            anydata userIdRaw = userMapOpt["id"];
            if (userIdRaw is string) {
                string userId = userIdRaw;
                mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
                if (dbResult is error) {
                    return createResponse(500, "Database connection failed", dbResult.message());
                }
                mongodb:Database db = dbResult;
                mongodb:Collection|error collectionResult = db->getCollection("user_progress");
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
                    return createResponse(200, "{\"completedModules\": [], \"userId\": \"" + userId + "\"}", ());
                } else {
                    map<anydata> progressMap = <map<anydata>>data[0];
                    return createResponse(200, progressMap.toString(), ());
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
