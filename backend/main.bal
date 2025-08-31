import ballerina/http;
import backend.database as database;
import backend.dsa as dsa;
import backend.networking as networking;
import backend.forum as forum;
import backend.resources as resources;

import ballerina/time;
import ballerinax/mongodb;
import ballerina/log;

// Configuration constants (inline for now)
const int SERVER_PORT = 3001;
const string MONGODB_CONNECTION_STRING = "mongodb+srv://mohamedashrif325:rqpBqU7bpqO72qkO@cluster0.3591lxr.mongodb.net/";

listener http:Listener httpListener = new (SERVER_PORT);

// MongoDB client for local database
mongodb:ConnectionConfig mongoConfig = {
    connection: MONGODB_CONNECTION_STRING
};

function initMongoClient() returns mongodb:Client {
    mongodb:Client|error clientResult = new (mongoConfig);
    if (clientResult is error) {
        panic clientResult;
    }
    return clientResult;
}

mongodb:Client mongoClient = initMongoClient();

// Utility function to create standardized responses with CORS headers
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

// In-memory session store
map<map<anydata>> sessionStore = {};

// Initialize MongoDB indexes
function createIndexes() returns error? {
    mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
    if (dbResult is error) {
        log:printError("Failed to connect to database for indexing: " + dbResult.message());
        return dbResult;
    }
    mongodb:Database db = dbResult;
    mongodb:Collection|error collectionResult = db->getCollection("user_progress");
    if (collectionResult is error) {
        log:printError("Failed to get collection for indexing: " + collectionResult.message());
        return collectionResult;
    }
    mongodb:Collection progressCollection = collectionResult;
    // Drop all indexes except _id_
    error? dropResult = progressCollection->dropIndexes();
    if (dropResult is error) {
        log:printError("Failed to drop indexes: " + dropResult.message());
    }
    // Create unique index on userId
    map<json> indexSpec = { userId: 1 };
    error? indexResult = progressCollection->createIndex(indexSpec, { unique: true });
    if (indexResult is error) {
        log:printError("Failed to create userId index: " + indexResult.message());
        return indexResult;
    } else {
        log:printInfo("Unique index on userId ensured for user_progress collection");
    }
    return ();
}

// Call this during initialization
// Call createIndexes inside a function or at module level, not in the global scope
function init() {
    // Make initialization more robust - don't fail if indexing fails
    error? indexResult = createIndexes();
    if (indexResult is error) {
        log:printError("Failed to create indexes: " + indexResult.message());
    }
    
    error? networkingIndexResult = networking:createNetworkingIndexes(mongoClient);
    if (networkingIndexResult is error) {
        log:printError("Failed to create networking indexes: " + networkingIndexResult.message());
    }
}

service /api on httpListener {
    // Resource Library endpoints
    resource function get resources(http:Request req) returns http:Response|error {
        return resources:get_resources(req);
    }

    // Resource rating endpoints
    resource function post resources/[string id]/rate(http:Request req) returns http:Response|error {
        return resources:post_resource_rating(req, id);
    }
    resource function get resources/[string id]/ratings(http:Request req) returns http:Response|error {
        return resources:get_resource_ratings(req, id);
    }
    // Forum endpoints
    resource function delete forum/thread/[string id](http:Request req) returns http:Response|error {
        return forum:delete_forum_thread(req, id, mongoClient);
    }

    resource function post forum/thread(http:Request req) returns http:Response|error {
        return forum:post_forum_thread(req, mongoClient);
    }

    resource function get forum/threads(http:Request req) returns http:Response|error {
        return forum:get_forum_threads(req, mongoClient);
    }

    resource function post forum/reply(http:Request req) returns http:Response|error {
        return forum:post_forum_reply(req, mongoClient);
    }

    resource function get forum/thread/[string id](http:Request req) returns http:Response|error {
        return forum:get_forum_thread_details(req, id, mongoClient);
    }

    // Test endpoint to verify backend is working
    resource function get test() returns http:Response|error {
        log:printInfo("Test endpoint called");
        
        // Test MongoDB connection
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            log:printError("Failed to connect to MongoDB: " + dbResult.message());
            return createResponse(500, "MongoDB connection failed", dbResult.message());
        }
        
        mongodb:Database db = dbResult;
        mongodb:Collection|error collectionResult = db->getCollection("test_endpoint");
        if (collectionResult is error) {
            log:printError("Failed to get collection: " + collectionResult.message());
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        mongodb:Collection testCollection = collectionResult;
        
        record {|
            string message;
            string timestamp;
            string endpoint;
        |} testDoc = {
            message: "Test from /test endpoint",
            timestamp: time:utcNow().toString(),
            endpoint: "/api/test"
        };
        
        error? insertResult = testCollection->insertOne(testDoc);
        if (insertResult is error) {
            log:printError("Failed to insert test document: " + insertResult.message());
            return createResponse(500, "MongoDB test failed", insertResult.message());
        }
        
        log:printInfo("Successfully inserted test document");
        return createResponse(200, "Backend is working! MongoDB connected and document created successfully", null);
    }

    resource function post auth/signup(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON", "Invalid JSON payload");
        }

        json payload = payloadOrError;

        // Extract fields safely
        string email = "";
        string password = "";
        string name = "";

        json|error emailField = payload.email;
        if (emailField is string) {
            email = emailField;
        }
        json|error passwordField = payload.password;
        if (passwordField is string) {
            password = passwordField;
        }
        json|error nameField = payload.name;
        if (nameField is string) {
            name = nameField;
        }

        if (email == "" || password == "" || name == "") {
            return createResponse(400, "Missing email, password, or name", "Required fields missing");
        }

        // Connect to MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Database db = dbResult;
        mongodb:Collection|error collectionResult = db->getCollection("users");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        mongodb:Collection usersCollection = collectionResult;
        
        // Check if user already exists
        map<json> filter = {
            email: email
        };
        
        stream<record {}, error?>|error findResult = usersCollection->find(filter);
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
        
        if (data.length() > 0) {
            return createResponse(409, "User already exists", "Email already registered");
        }
        
        // Create user document
        record {|
            string id;
            string email;
            string password;
            string name;
            string timestamp;
            string role;
        |} userDoc = {
            id: "user_" + time:utcNow().toString(),
            email: email,
            password: password, // In production, hash this password
            name: name,
            timestamp: time:utcNow().toString(),
            role: "student"
        };
        
        error? insertResult = usersCollection->insertOne(userDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to create user", insertResult.message());
        }
        
        string userResponse = "{\"token\": \"dummy-token-123\", \"user\": {\"id\": \"" + userDoc.id + "\", \"email\": \"" + email + "\", \"name\": \"" + name + "\", \"createdAt\": \"" + userDoc.timestamp + "\", \"updatedAt\": \"" + userDoc.timestamp + "\"}}";
        return createResponse(201, userResponse, null);
    }

    // Fix: Change signin to login to match frontend expectations
    resource function post auth/login(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON", "Invalid JSON payload");
        }
        json payload = payloadOrError;
        string email = "";
        string password = "";
        json|error emailField = payload.email;
        if (emailField is string) {
            email = emailField;
        }
        json|error passwordField = payload.password;
        if (passwordField is string) {
            password = passwordField;
        }
        if (email == "" || password == "") {
            return createResponse(400, "Missing email or password", "Required fields missing");
        }
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        mongodb:Database db = dbResult;
        mongodb:Collection|error collectionResult = db->getCollection("users");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        mongodb:Collection usersCollection = collectionResult;
        map<json> filter = { email: email };
        stream<record {}, error?>|error findResult = usersCollection->find(filter);
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
            return createResponse(401, "Invalid credentials", "User not found");
        }
        map<anydata> userMap = <map<anydata>>data[0];
        string dbPassword = <string>userMap["password"];
        if (password != dbPassword) {
            return createResponse(401, "Invalid credentials", "Incorrect password");
        }
        // Generate a session token using email and timestamp
        string token = email + "_" + time:utcNow().toString();
        userMap["password"] = ();
        
        // Store session in both memory and MongoDB for persistence
        sessionStore[token] = userMap;
        
        // Store session in MongoDB for persistence across service restarts
        mongodb:Collection|error sessionCollectionResult = db->getCollection("user_sessions");
        if (sessionCollectionResult is error) {
            log:printError("Failed to get sessions collection: " + sessionCollectionResult.message());
        } else {
            mongodb:Collection sessionCollection = sessionCollectionResult;
            
            // Create session document
            record {|
                string token;
                json userData;
                string createdAt;
                string lastAccessed;
            |} sessionDoc = {
                token: token,
                userData: userMap.toString(),
                createdAt: time:utcNow().toString(),
                lastAccessed: time:utcNow().toString()
            };
            
            // Insert or update session
            map<json> sessionFilter = { token: token };
            mongodb:Update updateDoc = { "$set": sessionDoc };
            var upsertResult = sessionCollection->updateOne(sessionFilter, updateDoc, { upsert: true });
            if (upsertResult is error) {
                log:printError("Failed to store session in MongoDB: " + upsertResult.message());
            }
        }
        
        string userJson = userMap.toString();
        string loginResponse = "{\"token\": \"" + token + "\", \"user\": " + userJson + "}";
        return createResponse(200, loginResponse, null);
    }

    // Add missing auth/me endpoint
    resource function get auth/me(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if (authHeader is string && authHeader.startsWith("Bearer ")) {
            string token = authHeader.substring(7, authHeader.length());
            
            // First check in-memory session store
            map<anydata>? userMapOpt = sessionStore[token];
            if (userMapOpt is map<anydata>) {
                return createResponse(200, userMapOpt.toString(), null);
            }
            
            // If not in memory, check MongoDB sessions collection
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error sessionCollectionResult = db->getCollection("user_sessions");
            if (sessionCollectionResult is error) {
                return createResponse(500, "Collection access failed", sessionCollectionResult.message());
            }
            
            mongodb:Collection sessionCollection = sessionCollectionResult;
            
            // Find session in MongoDB
            map<json> sessionFindFilter = { token: token };
            stream<record {}, error?>|error findResult = sessionCollection->find(sessionFindFilter);
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
            
            if (data.length() > 0) {
                // Session found in MongoDB, restore it to memory and return user data
                map<anydata> sessionData = <map<anydata>>data[0];
                anydata userDataField = sessionData["userData"];
                
                string userDataString = "";
                if (userDataField is string) {
                    userDataString = <string>userDataField;
                } else if (userDataField is json) {
                    userDataString = <string>userDataField;
                } else {
                    return createResponse(500, "Invalid user data format", "User data is not a string or JSON");
                }
                
                // Parse the JSON string back to map<anydata>
                json|error jsonResult = userDataString.fromJsonString();
                if (jsonResult is error) {
                    return createResponse(500, "Failed to parse user data", "Invalid user data format");
                }
                map<anydata>|error userMapResult = <map<anydata>>jsonResult;
                if (userMapResult is error) {
                    return createResponse(500, "Failed to convert user data", "Invalid user data structure");
                }
                map<anydata> userMap = userMapResult;
                
                // Restore to memory for faster future access
                sessionStore[token] = userMap;
                
                // Update last accessed time
                map<json> sessionUpdateFilter = { token: token };
                map<json> updateFields = { lastAccessed: time:utcNow().toString() };
                mongodb:Update updateDoc = { "$set": updateFields };
                var updateResult = sessionCollection->updateOne(sessionUpdateFilter, updateDoc);
                if (updateResult is error) {
                    log:printError("Failed to update session last accessed time: " + updateResult.message());
                }
                
                return createResponse(200, userMap.toString(), null);
            } else {
                return createResponse(401, "Invalid token", "Session not found");
            }
        } else {
            return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
        }
    }

    // Progress tracking endpoints
    // Database progress endpoints
    resource function post user_progress_mark_completed(http:Request req) returns http:Response|error {
        return database:user_progress_mark_completed(req, sessionStore, mongoClient);
    }

    resource function get user/progress(http:Request req) returns http:Response|error {
        return database:get_user_progress(req, sessionStore, mongoClient);
    }

    // DSA progress endpoints
    resource function post dsa_progress_mark_completed(http:Request req) returns http:Response|error {
        return dsa:dsa_progress_mark_completed(req, sessionStore, mongoClient);
    }

    resource function get dsa/progress(http:Request req) returns http:Response|error {
        return dsa:get_dsa_user_progress(req, sessionStore, mongoClient);
    }

    // Networking endpoints - now handled by the networking module
    resource function post networking/tcp/handshake(http:Request req) returns http:Response|error {
        return networking:save_tcp_handshake(req, sessionStore, mongoClient);
    }

    resource function post networking/dns/resolution(http:Request req) returns http:Response|error {
        return networking:save_dns_resolution(req, sessionStore, mongoClient);
    }

    resource function post networking/subnet/calculate(http:Request req) returns http:Response|error {
        return networking:save_subnet_calculation(req, sessionStore, mongoClient);
    }

    resource function post networking/subnet/exercise_progress(http:Request req) returns http:Response|error {
        http:Response|error result = networking:save_subnet_exercise_progress(req, sessionStore, mongoClient);
        return result;
    }

    resource function post networking/topology/save(http:Request req) returns http:Response|error {
        return networking:save_network_topology(req, sessionStore, mongoClient);
    }

    resource function get networking/topology/list(http:Request req) returns http:Response|error {
        return networking:get_network_topologies(req, sessionStore, mongoClient);
    }

    resource function get networking/topology/types() returns http:Response|error {
        return networking:get_topology_types();
    }

    resource function post networking/topology/simulate(http:Request req) returns http:Response|error {
        return networking:simulate_topology(req, sessionStore, mongoClient);
    }

    // Temporarily commented out due to compilation issues
    // resource function post networking/topology/failure-test(http:Request req) returns http:Response|error {
    //     return networking:test_topology_failure(req, sessionStore, mongoClient);
    // }

    resource function post networking/progress/update(http:Request req) returns http:Response|error {
        return networking:update_learning_progress(req, sessionStore, mongoClient);
    }

    // Progress endpoint that accepts userId as query parameter
    resource function get networking/progress/user(http:Request req) returns http:Response|error {
        return networking:get_learning_progress(req, sessionStore, mongoClient);
    }

    resource function get networking/status() returns http:Response|error {
        return networking:get_networking_status();
    }

    resource function get networking/modules() returns http:Response|error {
        return networking:get_networking_modules();
    }

    // Protocol analysis endpoint
    resource function post networking/protocol/analyze(http:Request req) returns http:Response|error {
        // TODO: Implement protocol analysis functionality
        return createResponse(200, "{\"message\": \"Protocol analysis endpoint ready\"}", null);
    }

    // Security scanning endpoint
    resource function post networking/security/scan(http:Request req) returns http:Response|error {
        // TODO: Implement security scanning functionality
        return createResponse(200, "{\"message\": \"Security scanning endpoint ready\"}", null);
    }

    // Performance monitoring endpoint
    resource function post networking/performance/monitor(http:Request req) returns http:Response|error {
        // TODO: Implement performance monitoring functionality
        return createResponse(200, "{\"message\": \"Performance monitoring endpoint ready\"}", null);
    }

    // Learning analytics endpoint
    resource function get networking/analytics/user(http:Request req) returns http:Response|error {
        // TODO: Implement learning analytics functionality
        return createResponse(200, "{\"message\": \"Learning analytics endpoint ready\"}", null);
    }

    // Global OPTIONS handler for CORS preflight requests
    resource function options .() returns http:Response {
        http:Response res = new();
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res;
    }
}