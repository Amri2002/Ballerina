import ballerina/http;
import backend.database as database;
import ballerina/time;
import ballerinax/mongodb;
import ballerina/log;

const string JWT_ISSUER = "ballerina-backend";
const string JWT_AUDIENCE = "ballerina-frontend";
const string JWT_SECRET = "supersecretkey";

listener http:Listener httpListener = new (3001);

// MongoDB client for local database
mongodb:ConnectionConfig config = {
    connection: "mongodb+srv://mohamedashrif325:rqpBqU7bpqO72qkO@cluster0.3591lxr.mongodb.net/"
};

function initMongoClient() returns mongodb:Client {
    mongodb:Client|error clientResult = new (config);
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
function createIndexes() {
    mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
    if (dbResult is error) {
        log:printError("Failed to connect to database for indexing: " + dbResult.message());
        return;
    }
    
    mongodb:Database db = dbResult;
    mongodb:Collection|error collectionResult = db->getCollection("user_progress");
    if (collectionResult is error) {
        log:printError("Failed to get collection for indexing: " + collectionResult.message());
        return;
    }
    
    mongodb:Collection progressCollection = collectionResult;
    
    // Create index on userId for faster queries
    map<json> indexSpec = { userId: 1 };
    error? indexResult = progressCollection->createIndex(indexSpec, { unique: true });
    if (indexResult is error) {
        log:printError("Failed to create index: " + indexResult.message());
    } else {
        log:printInfo("Successfully created index on user_progress collection");
    }
}

// Call this during initialization
// Call createIndexes inside a function or at module level, not in the global scope
function init() {
    createIndexes();
}

service /api on httpListener {

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
        return createResponse(200, "Backend is working! MongoDB connected and document created successfully", ());
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
        
        return createResponse(201, "{\"token\": \"dummy-token-123\", \"user\": {\"id\": \"" + userDoc.id + "\", \"email\": \"" + email + "\", \"name\": \"" + name + "\", \"createdAt\": \"" + userDoc.timestamp + "\", \"updatedAt\": \"" + userDoc.timestamp + "\"}}", ());
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
        sessionStore[token] = userMap;
        string userJson = userMap.toString();
        return createResponse(200, "{\"token\": \"" + token + "\", \"user\": " + userJson + "}", ());
    }

    // Add missing auth/me endpoint
    resource function get auth/me(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if (authHeader is string && authHeader.startsWith("Bearer ")) {
            string token = authHeader.substring(7, authHeader.length());
            map<anydata>? userMapOpt = sessionStore[token];
            if userMapOpt is map<anydata> {
                return createResponse(200, userMapOpt.toString(), ());
            } else {
                return createResponse(401, "Invalid token", "Session not found");
            }
        } else {
            return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
        }
    }

    // Progress tracking endpoints
        // Progress tracking endpoints are now handled in the database module
        resource function post user_progress_mark_completed(http:Request req) returns http:Response|error {
        return database:user_progress_mark_completed(req, sessionStore, mongoClient);
        }

        resource function get user/progress(http:Request req) returns http:Response|error {
        return database:get_user_progress(req, sessionStore, mongoClient);
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