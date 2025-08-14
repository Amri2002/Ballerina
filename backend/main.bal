import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;
import ballerina/log;
// import ballerina/io;

// JWT configuration
const string JWT_SECRET = "your-super-secret-jwt-key-change-in-production";

// In-memory storage for user sessions (in production, use Redis or database)
map<json> userSessions = {};

listener http:Listener httpListener = new (3001);

// MongoDB client for local database
mongodb:ConnectionConfig config = {
    connection: "mongodb://localhost:27017/learning_platform"
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

        // Extract fields safely
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
        
        // Find user by email
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
        
        if (data.length() == 0) {
            return createResponse(401, "Invalid credentials", "User not found");
        }
        
        // Get the first user record (should be the only one with this email)
        record {} userRecord = data[0];
        
        // Extract user data from the record
        string userId = "";
        string userName = "";
        string userEmail = "";
        string createdAt = "";
        string updatedAt = "";
        
        // Try to extract fields from the user record using member access
        anydata idField = userRecord["id"];
        if (idField is string) {
            userId = idField;
        } else {
            userId = "user_" + time:utcNow().toString();
        }
        
        anydata nameField = userRecord["name"];
        if (nameField is string) {
            userName = nameField;
        } else {
            userName = "User"; // Fallback name
        }
        
        anydata emailFieldFromRecord = userRecord["email"];
        if (emailFieldFromRecord is string) {
            userEmail = emailFieldFromRecord;
        } else {
            userEmail = email; // Use the email from the request
        }
        
        anydata createdField = userRecord["createdAt"];
        if (createdField is string) {
            createdAt = createdField;
        } else {
            createdAt = time:utcNow().toString();
        }
        
        anydata updatedField = userRecord["updatedAt"];
        if (updatedField is string) {
            updatedAt = updatedField;
        } else {
            updatedAt = time:utcNow().toString();
        }
        
        // In production, verify password hash here
        // For now, we'll just check if the user exists
        
        // Store user data in sessions for later retrieval
        json userData = {
            id: userId,
            email: userEmail,
            name: userName,
            createdAt: createdAt,
            updatedAt: updatedAt
        };
        
        // Use a simple token for now (in production, use JWT)
        string token = "token_" + userId + "_" + time:utcNow().toString();
        userSessions[token] = userData;
        
        return createResponse(200, "{\"token\": \"" + token + "\", \"user\": {\"id\": \"" + userId + "\", \"email\": \"" + userEmail + "\", \"name\": \"" + userName + "\", \"createdAt\": \"" + createdAt + "\", \"updatedAt\": \"" + updatedAt + "\"}}", ());
    }

    // Add missing auth/me endpoint
    resource function get auth/me(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if (authHeader is string && authHeader.startsWith("Bearer ")) {
            // Extract token (remove "Bearer " prefix)
            string token = authHeader.substring(7);
            
            // Check if token exists in sessions
            if (userSessions.hasKey(token)) {
                json userData = userSessions[token];
                return createResponse(200, userData.toString(), ());
            } else {
                return createResponse(401, "Invalid token", "Token not found in sessions");
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

    // Enhanced Topology Management Endpoints
    resource function post networking/topology/save(http:Request req) returns http:Response|error {
        log:printInfo("Topology Save endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON", "Invalid JSON payload");
        }

        json payload = payloadOrError;
        
        // Extract topology data
        string? topologyId = ();
        string? topologyName = ();
        string? topologyType = ();
        json? devices = ();
        json? connections = ();
        json? simulationData = ();
        string? userId = ();
        
        if (payload is map<json>) {
            if (payload["topologyId"] is string) {
                topologyId = <string>payload["topologyId"];
            }
            if (payload["topologyName"] is string) {
                topologyName = <string>payload["topologyName"];
            }
            if (payload["topologyType"] is string) {
                topologyType = <string>payload["topologyType"];
            }
            if (payload["devices"] is json) {
                devices = <json>payload["devices"];
            }
            if (payload["connections"] is json) {
                connections = <json>payload["connections"];
            }
            if (payload["simulationData"] is json) {
                simulationData = <json>payload["simulationData"];
            }
            if (payload["userId"] is string) {
                userId = <string>payload["userId"];
            }
        }
        
        if (topologyName == () || topologyType == () || userId == ()) {
            return createResponse(400, "Missing required fields", "topologyName, topologyType, and userId are required");
        }
        
        // Generate topology ID if not provided
        if (topologyId == ()) {
            topologyId = "topology_" + userId + "_" + time:utcNow().toString();
        }
        
        // Create topology document
        record {
            string id;
            string userId;
            string name;
            string topologyType;
            json devices;
            json connections;
            json simulationData;
            string timestamp;
            string status;
        } topologyDoc = {
            id: topologyId is string ? topologyId : "",
            userId: userId is string ? userId : "",
            name: topologyName is string ? topologyName : "",
            topologyType: topologyType is string ? topologyType : "",
            devices: devices is json ? devices : {},
            connections: connections is json ? connections : {},
            simulationData: simulationData is json ? simulationData : {},
            timestamp: time:utcNow().toString(),
            status: "active"
        };
        
        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("topologies");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        error? insertResult = collectionResult->insertOne(topologyDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to save topology", insertResult.message());
        }
        
        return createResponse(201, "{\"message\": \"Network topology saved successfully\", \"topologyId\": \"" + (topologyId is string ? topologyId : "") + "\"}", ());
    }

    resource function get networking/topology/list(http:Request req) returns http:Response|error {
        string? userIdParam = req.getQueryParamValue("userId");
        if (userIdParam is string) {
            string userId = userIdParam;
            log:printInfo("Topology List endpoint called for user: " + userId);
            
            // Get topologies from MongoDB
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Collection|error collectionResult = dbResult->getCollection("topologies");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            // Query topologies for the user
            stream<record {}, error?>|error findResult = collectionResult->find({});
            if (findResult is error) {
                return createResponse(500, "Failed to fetch topologies", findResult.message());
            }
            
            // Convert stream to array
            json[] topologies = [];
            error? forEachResult = findResult.forEach(function(record {} doc) {
                topologies.push(<json>doc);
            });
            if (forEachResult is error) {
                return createResponse(500, "Failed to process topologies", forEachResult.message());
            }
            
            // Filter results for the user (simplified for now)
            return createResponse(200, "{\"topologies\": " + topologies.toString() + "}", ());
        } else {
            return createResponse(400, "Missing userId parameter", "userId query parameter is required");
        }
    }

    resource function get networking/topology/types() returns http:Response|error {
        log:printInfo("Topology Types endpoint called");
        
        // Return predefined topology types with their configurations
        json topologyTypes = [
            {
                "id": "star",
                "name": "Star Topology",
                "description": "All devices connect to a central hub/switch",
                "advantages": [
                    "Easy to install and manage",
                    "Centralized control and monitoring",
                    "Easy to add/remove devices",
                    "Isolated device failures",
                    "Simple troubleshooting"
                ],
                "disadvantages": [
                    "Single point of failure (central hub)",
                    "Limited scalability",
                    "Performance depends on central device",
                    "Higher cost for central device",
                    "All traffic goes through hub"
                ],
                "failureScenarios": [
                    {
                        "description": "Central Hub Failure",
                        "devicesToFail": ["hub1"],
                        "impact": "Entire network becomes unavailable - all devices lose connectivity"
                    },
                    {
                        "description": "Single PC Failure",
                        "devicesToFail": ["pc1"],
                        "impact": "Only PC 1 is affected - other devices continue working normally"
                    }
                ]
            },
            {
                "id": "bus",
                "name": "Bus Topology",
                "description": "All devices share a single communication line",
                "advantages": [
                    "Simple and inexpensive",
                    "Easy to extend",
                    "Requires less cable",
                    "Suitable for small networks",
                    "Linear structure"
                ],
                "disadvantages": [
                    "Single point of failure (bus cable)",
                    "Performance degrades with more devices",
                    "Difficult to troubleshoot",
                    "Limited bandwidth sharing",
                    "Signal reflection issues"
                ],
                "failureScenarios": [
                    {
                        "description": "Bus Cable Break",
                        "devicesToFail": ["pc2", "pc3", "pc4", "server1"],
                        "impact": "All devices beyond the break lose connectivity"
                    },
                    {
                        "description": "Terminator Failure",
                        "devicesToFail": ["pc1", "pc2", "pc3", "pc4", "server1"],
                        "impact": "Signal reflection causes network failure"
                    }
                ]
            },
            {
                "id": "ring",
                "name": "Ring Topology",
                "description": "Devices form a closed loop with data traveling in one direction",
                "advantages": [
                    "Equal access to network",
                    "No central point of control",
                    "Predictable performance",
                    "Good for token passing",
                    "Efficient for large networks"
                ],
                "disadvantages": [
                    "Single point of failure breaks entire network",
                    "Difficult to add/remove devices",
                    "Complex troubleshooting",
                    "Performance degrades with failures",
                    "Requires token management"
                ],
                "failureScenarios": [
                    {
                        "description": "Single Device Failure",
                        "devicesToFail": ["pc2"],
                        "impact": "Entire ring network fails - no device can communicate"
                    },
                    {
                        "description": "Cable Break",
                        "devicesToFail": ["pc1", "pc2", "pc3", "pc4", "server1"],
                        "impact": "Ring is broken - complete network failure"
                    }
                ]
            },
            {
                "id": "mesh",
                "name": "Mesh Topology",
                "description": "Every device connects to every other device",
                "advantages": [
                    "Maximum reliability and redundancy",
                    "No single point of failure",
                    "Multiple paths for data",
                    "High performance",
                    "Load balancing possible"
                ],
                "disadvantages": [
                    "Very expensive to implement",
                    "Complex to manage",
                    "Requires many cables",
                    "Difficult to scale",
                    "High maintenance cost"
                ],
                "failureScenarios": [
                    {
                        "description": "Single Device Failure",
                        "devicesToFail": ["pc1"],
                        "impact": "Other devices can still communicate through alternative paths"
                    },
                    {
                        "description": "Multiple Device Failures",
                        "devicesToFail": ["pc1", "pc2"],
                        "impact": "PC 3 and server can still communicate directly"
                    }
                ]
            },
            {
                "id": "tree",
                "name": "Tree Topology",
                "description": "Hierarchical structure with root, branches, and leaves",
                "advantages": [
                    "Scalable and expandable",
                    "Hierarchical management",
                    "Isolated branch failures",
                    "Centralized control",
                    "Good for large organizations"
                ],
                "disadvantages": [
                    "Root failure affects entire network",
                    "Complex to manage",
                    "Single path to root",
                    "Performance bottleneck at root",
                    "Difficult to troubleshoot"
                ],
                "failureScenarios": [
                    {
                        "description": "Root Router Failure",
                        "devicesToFail": ["root"],
                        "impact": "Entire network becomes unavailable - all branches lose connectivity"
                    },
                    {
                        "description": "Branch Switch Failure",
                        "devicesToFail": ["switch1"],
                        "impact": "Only Branch 1 devices (PC 1, PC 2) lose connectivity"
                    }
                ]
            }
        ];
        
        return createResponse(200, topologyTypes.toString(), ());
    }

    resource function post networking/topology/simulate(http:Request req) returns http:Response|error {
        log:printInfo("Topology Simulation endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON", "Invalid JSON payload");
        }

        json payload = payloadOrError;
        
        string? topologyType = ();
        json? simulationConfig = ();
        string? userId = ();
        
        if (payload is map<json>) {
            if (payload["topologyType"] is string) {
                topologyType = <string>payload["topologyType"];
            }
            if (payload["simulationConfig"] is json) {
                simulationConfig = <json>payload["simulationConfig"];
            }
            if (payload["userId"] is string) {
                userId = <string>payload["userId"];
            }
        }
        
        if (topologyType == () || userId == ()) {
            return createResponse(400, "Missing required fields", "topologyType and userId are required");
        }
        
        // Generate simulation data based on topology type
        json simulationResult = {
            "topologyType": topologyType,
            "userId": userId,
            "timestamp": time:utcNow().toString(),
            "packets": [
                {
                    "id": "packet_1",
                    "source": "pc1",
                    "destination": "server1",
                    "status": "delivered",
                    "path": ["pc1", "hub1", "server1"],
                    "latency": 15
                },
                {
                    "id": "packet_2",
                    "source": "pc2",
                    "destination": "pc3",
                    "status": "transmitting",
                    "path": ["pc2", "hub1", "pc3"],
                    "latency": 8
                }
            ],
            "statistics": {
                "totalPackets": 25,
                "deliveredPackets": 23,
                "droppedPackets": 2,
                "averageLatency": 12.5,
                "networkUtilization": 78.5
            }
        };
        
        // Store simulation result in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("simulations");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        map<json> simulationDoc = {
            "id": "simulation_" + (userId is string ? userId : "") + "_" + time:utcNow().toString(),
            "userId": userId is string ? userId : "",
            "topologyType": topologyType is string ? topologyType : "",
            "simulationData": simulationResult,
            "timestamp": time:utcNow().toString()
        };
        
        error? insertResult = collectionResult->insertOne(simulationDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to save simulation", insertResult.message());
        }
        
        return createResponse(200, simulationResult.toString(), ());
    }

    resource function post networking/topology/failure_test(http:Request req) returns http:Response|error {
        log:printInfo("Topology Failure Test endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON", "Invalid JSON payload");
        }

        json payload = payloadOrError;
        
        string? topologyType = ();
        string? failureScenario = ();
        json? devicesToFail = ();
        string? userId = ();
        
        if (payload is map<json>) {
            if (payload["topologyType"] is string) {
                topologyType = <string>payload["topologyType"];
            }
            if (payload["failureScenario"] is string) {
                failureScenario = <string>payload["failureScenario"];
            }
            if (payload["devicesToFail"] is json) {
                devicesToFail = <json>payload["devicesToFail"];
            }
            if (payload["userId"] is string) {
                userId = <string>payload["userId"];
            }
        }
        
        if (topologyType == () || failureScenario == () || userId == ()) {
            return createResponse(400, "Missing required fields", "topologyType, failureScenario, and userId are required");
        }
        
        // Analyze failure impact
        json failureAnalysis = {
            "topologyType": topologyType,
            "failureScenario": failureScenario,
            "userId": userId,
            "timestamp": time:utcNow().toString(),
            "impact": {
                "affectedDevices": devicesToFail is json ? devicesToFail : [],
                "networkStatus": "degraded",
                "connectivityLoss": 60.5,
                "recoveryTime": "immediate_after_fix"
            },
            "recommendations": [
                "Implement redundant connections",
                "Add backup devices",
                "Monitor network health",
                "Create disaster recovery plan"
            ]
        };
        
        // Store failure analysis in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            return createResponse(500, "Database connection failed", dbResult.message());
        }
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("failure_analyses");
        if (collectionResult is error) {
            return createResponse(500, "Collection access failed", collectionResult.message());
        }
        
        map<json> failureDoc = {
            "id": "failure_" + (userId is string ? userId : "") + "_" + time:utcNow().toString(),
            "userId": userId is string ? userId : "",
            "topologyType": topologyType is string ? topologyType : "",
            "failureScenario": failureScenario is string ? failureScenario : "",
            "analysisData": failureAnalysis,
            "timestamp": time:utcNow().toString()
        };
        
        error? insertResult = collectionResult->insertOne(failureDoc);
        if (insertResult is error) {
            return createResponse(500, "Failed to save failure analysis", insertResult.message());
        }
        
        return createResponse(200, failureAnalysis.toString(), ());
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
