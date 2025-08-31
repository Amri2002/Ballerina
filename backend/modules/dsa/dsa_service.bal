import ballerina/http;
import ballerinax/mongodb;
import ballerina/log;

const string DATABASE = "learning_platform";
const string COLLECTION = "dsa_progress";

// Mark a DSA lesson/challenge as completed
public function dsa_mark_completed(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
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
            string itemId = "";
            string itemType = "lesson";
            json|error itemIdField = payload.itemId;
            json|error itemTypeField = payload.itemType;
            if (itemIdField is string) {
                itemId = itemIdField;
            }
            if (itemTypeField is string) {
                itemType = itemTypeField;
            }
            if (itemId == "") {
                return createResponse(400, "Missing itemId", "Required field missing");
            }
            // Query MongoDB for previous completed items
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
            string[] completedLessons = [];
            string[] completedChallenges = [];
            if (data.length() == 0) {
                if (itemType == "lesson") {
                    completedLessons = [itemId];
                } else {
                    completedChallenges = [itemId];
                }
            } else {
                map<anydata> progressMap = <map<anydata>>data[0];
                anydata[] lessonsAny = [];
                anydata[] challengesAny = [];
                if progressMap.hasKey("completedLessons") {
                    anydata lessonsRaw = progressMap["completedLessons"];
                    if (lessonsRaw is anydata[]) {
                        lessonsAny = lessonsRaw;
                    }
                }
                if progressMap.hasKey("completedChallenges") {
                    anydata challengesRaw = progressMap["completedChallenges"];
                    if (challengesRaw is anydata[]) {
                        challengesAny = challengesRaw;
                    }
                }
                foreach var l in lessonsAny {
                    if (l is string) {
                        completedLessons.push(l);
                    }
                }
                foreach var c in challengesAny {
                    if (c is string) {
                        completedChallenges.push(c);
                    }
                }
                if (itemType == "lesson" && !arrayHas(completedLessons, itemId)) {
                    completedLessons.push(itemId);
                }
                if (itemType == "challenge" && !arrayHas(completedChallenges, itemId)) {
                    completedChallenges.push(itemId);
                }
            }
            // Upsert progress using updateOne with upsert: true
            map<json> upsertFilter = { userId: userId };
            map<json> updateDoc = { "$set": {
                userId: userId,
                completedLessons: completedLessons,
                completedChallenges: completedChallenges
            }};
            mongodb:UpdateOptions options = { upsert: true };
            _ = check progressCollection->updateOne(upsertFilter, updateDoc, options);
            return createResponse(200, "{\"message\": \"Progress updated successfully\"}", null);
// Helper: check if a string array contains a value
function arrayHas(string[] arr, string val) returns boolean {
    foreach var item in arr {
        if item == val {
            return true;
        }
    }
    return false;
}
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Get user DSA progress
public function dsa_get_progress(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
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
                    return createResponse(200, "{\"completedLessons\": [], \"completedChallenges\": [], \"userId\": \"" + userId + "\"}", null);
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
