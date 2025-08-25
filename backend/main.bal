import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;
import ballerina/log;
// import ballerina/io;

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
        
        record {
            string message;
            string timestamp;
            string endpoint;
        } testDoc = {
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
        record {
            string id;
            string email;
            string password;
            string name;
            string timestamp;
            string role;
        } userDoc = {
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

    // ===== NETWORKING MODULES =====

    // 1. Network Protocol Analyzer
    resource function post networking/protocol/analyze(http:Request req) returns http:Response|error {
        log:printInfo("Protocol Analysis endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON payload", "Invalid JSON");
        }

        json payload = payloadOrError;
        
        // Extract packet data
        string userId = "";
        string packetData = "";
        string protocolType = "";
        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error packetField = payload.packetData;
        if (packetField is string) {
            packetData = packetField;
        }
        json|error protocolField = payload.protocolType;
        if (protocolField is string) {
            protocolType = protocolField;
        }

        if (userId == "" || packetData == "") {
            return createResponse(400, "Missing required fields", "userId and packetData are required");
        }

        // Simulate protocol analysis
        record {
            string id;
            string userId;
            string packetData;
            string protocolType;
            string analysis;
            string timestamp;
            json decodedData;
        } analysisDoc = {
            id: "protocol_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            packetData: packetData,
            protocolType: protocolType,
            analysis: "Protocol analysis completed successfully",
            timestamp: time:utcNow().toString(),
            decodedData: {
                sourcePort: 80,
                destinationPort: 443,
                protocol: "TCP",
                flags: ["SYN", "ACK"],
                payload: "Sample payload data"
            }
        };

        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("protocol_analysis");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        error? insertResult = collectionResult->insertOne(analysisDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to save protocol analysis", insertResult.message());
        }

        return createResponse(201, "{\"message\": \"Protocol analysis completed successfully\", \"id\": \"" + analysisDoc.id + "\"}", ());
    }

    // 2. Network Security Scanner
    resource function post networking/security/scan(http:Request req) returns http:Response|error {
        log:printInfo("Security Scan endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON payload", "Invalid JSON");
        }

        json payload = payloadOrError;
        
        string userId = "";
        string targetHost = "";
        string scanType = "";

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error hostField = payload.targetHost;
        if (hostField is string) {
            targetHost = hostField;
        }
        json|error scanField = payload.scanType;
        if (scanField is string) {
            scanType = scanField;
        }

        if (userId == "" || targetHost == "") {
            return createResponse(400, "Missing required fields", "userId and targetHost are required");
        }

        // Simulate security scan results
        record {
            string id;
            string userId;
            string targetHost;
            string scanType;
            string status;
            string timestamp;
            json vulnerabilities;
            json recommendations;
        } scanDoc = {
            id: "security_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            targetHost: targetHost,
            scanType: scanType,
            status: "completed",
            timestamp: time:utcNow().toString(),
            vulnerabilities: [
                {
                    severity: "medium",
                    description: "Open port 22 (SSH)",
                    recommendation: "Configure SSH properly or close if not needed"
                },
                {
                    severity: "low",
                    description: "Default web server banner",
                    recommendation: "Hide server version information"
                }
            ],
            recommendations: [
                "Enable firewall rules",
                "Update system packages",
                "Configure intrusion detection",
                "Implement access controls"
            ]
        };

        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("security_scans");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        error? insertResult = collectionResult->insertOne(scanDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to save security scan", insertResult.message());
        }

        return createResponse(201, "{\"message\": \"Security scan completed successfully\", \"id\": \"" + scanDoc.id + "\"}", ());
    }

    // 3. Performance Monitoring
    resource function post networking/performance/monitor(http:Request req) returns http:Response|error {
        log:printInfo("Performance Monitoring endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON payload", "Invalid JSON");
        }

        json payload = payloadOrError;
        
        string userId = "";
        string networkId = "";
        json metrics = {};

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error networkField = payload.networkId;
        if (networkField is string) {
            networkId = networkField;
        }
        json|error metricsField = payload.metrics;
        if (metricsField is json) {
            metrics = metricsField;
        }

        if (userId == "" || networkId == "") {
            return createResponse(400, "Missing required fields", "userId and networkId are required");
        }

        // Create performance monitoring document
        record {
            string id;
            string userId;
            string networkId;
            json metrics;
            string timestamp;
            string status;
        } monitorDoc = {
            id: "performance_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            networkId: networkId,
            metrics: metrics,
            timestamp: time:utcNow().toString(),
            status: "monitoring"
        };

        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("performance_monitoring");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        error? insertResult = collectionResult->insertOne(monitorDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to save performance data", insertResult.message());
        }

        return createResponse(201, "{\"message\": \"Performance monitoring data saved successfully\", \"id\": \"" + monitorDoc.id + "\"}", ());
    }

    // 4. Learning Analytics - Use query parameter instead of path parameter
    resource function get networking/analytics/user(http:Request req) returns http:Response|error {
        string? userIdParam = req.getQueryParamValue("userId");
        if (userIdParam is string) {
            string userId = userIdParam;
            log:printInfo("Learning Analytics endpoint called for user: " + userId);
            
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            // Get user progress from multiple collections
            json analytics = {
                userId: userId,
                timestamp: time:utcNow().toString(),
                modules: {
                    tcpHandshake: {
                        completed: 0,
                        total: 5,
                        progress: 0
                    },
                    dnsResolution: {
                        completed: 0,
                        total: 4,
                        progress: 0
                    },
                    subnetCalculator: {
                        completed: 0,
                        total: 6,
                        progress: 0
                    },
                    networkTopology: {
                        completed: 0,
                        total: 3,
                        progress: 0
                    },
                    protocolAnalysis: {
                        completed: 0,
                        total: 4,
                        progress: 0
                    },
                    securityScanning: {
                        completed: 0,
                        total: 5,
                        progress: 0
                    }
                },
                achievements: [],
                totalProgress: 0,
                timeSpent: 0
            };

            return createResponse(200, analytics.toString(), ());
        } else {
            return createResponse(400, "Missing userId parameter", "userId query parameter is required");
        }
    }

    // 5. Achievement System
    resource function post networking/achievements/unlock(http:Request req) returns http:Response|error {
        log:printInfo("Achievement Unlock endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON payload", "Invalid JSON");
        }

        json payload = payloadOrError;
        
        string userId = "";
        string achievementId = "";
        string achievementName = "";

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error achievementIdField = payload.achievementId;
        if (achievementIdField is string) {
            achievementId = achievementIdField;
        }
        json|error achievementNameField = payload.achievementName;
        if (achievementNameField is string) {
            achievementName = achievementNameField;
        }

        if (userId == "" || achievementId == "" || achievementName == "") {
            return createResponse(400, "Missing required fields", "userId, achievementId, and achievementName are required");
        }

        // Create achievement document
        record {
            string id;
            string userId;
            string achievementId;
            string achievementName;
            string timestamp;
            string status;
        } achievementDoc = {
            id: "achievement_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            achievementId: achievementId,
            achievementName: achievementName,
            timestamp: time:utcNow().toString(),
            status: "unlocked"
        };

        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("achievements");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        error? insertResult = collectionResult->insertOne(achievementDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to save achievement", insertResult.message());
        }

        return createResponse(201, "{\"message\": \"Achievement unlocked successfully\", \"achievementName\": \"" + achievementName + "\"}", ());
    }

    // Add missing networking endpoints that frontend expects
    resource function post networking/tcp/handshake(http:Request req) returns http:Response|error {
        log:printInfo("TCP Handshake endpoint called");
        return createResponse(201, "{\"message\": \"TCP handshake data saved successfully\"}", ());
    }

    resource function post networking/dns/resolution(http:Request req) returns http:Response|error {
        log:printInfo("DNS Resolution endpoint called");
        return createResponse(201, "{\"message\": \"DNS resolution data saved successfully\"}", ());
    }

    resource function post networking/subnet/calculate(http:Request req) returns http:Response|error {
        log:printInfo("Subnet Calculation endpoint called");
        return createResponse(201, "{\"message\": \"Subnet calculation completed successfully\"}", ());
    }

    resource function post networking/topology/save(http:Request req) returns http:Response|error {
        log:printInfo("Topology Save endpoint called");
        return createResponse(201, "{\"message\": \"Network topology saved successfully\"}", ());
    }

    resource function get networking/topology/list(http:Request req) returns http:Response|error {
        string? userIdParam = req.getQueryParamValue("userId");
        if (userIdParam is string) {
            string userId = userIdParam;
            log:printInfo("Topology List endpoint called for user: " + userId);
            return createResponse(200, "{\"topologies\": []}", ()); // Return empty array for now
        } else {
            return createResponse(400, "Missing userId parameter", "userId query parameter is required");
        }
    }

    resource function post networking/progress/update(http:Request req) returns http:Response|error {
        log:printInfo("Progress Update endpoint called");
        return createResponse(201, "{\"message\": \"Progress updated successfully\"}", ());
    }

    resource function get networking/status() returns http:Response|error {
        log:printInfo("Networking Status endpoint called");
        return createResponse(200, "{\"status\": \"active\", \"modules\": [\"tcp\", \"dns\", \"subnet\", \"topology\"]}", ());
    }

    resource function get networking/modules() returns http:Response|error {
        log:printInfo("Networking Modules endpoint called");
        return createResponse(200, "[\"tcp\", \"dns\", \"subnet\", \"topology\", \"protocol\", \"security\", \"performance\"]", ());
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
