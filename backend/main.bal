import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;
import ballerina/log;

// JWT configuration
const string JWT_SECRET = "your-super-secret-jwt-key-change-in-production";

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

service /api on httpListener {

    // Test endpoint to verify backend is working
    resource function get test() returns http:Response|error {
        log:printInfo("Test endpoint called");
        
        // Test MongoDB connection
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            log:printError("Failed to connect to MongoDB: " + dbResult.message());
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("MongoDB connection failed: " + dbResult.message());
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        
        mongodb:Database db = dbResult;
        mongodb:Collection|error collectionResult = db->getCollection("test_endpoint");
        if (collectionResult is error) {
            log:printError("Failed to get collection: " + collectionResult.message());
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Collection access failed: " + collectionResult.message());
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
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
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("MongoDB test failed: " + insertResult.message());
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        
        log:printInfo("Successfully inserted test document");
        
        http:Response res = new();
        res.statusCode = 200;
        res.setPayload("Backend is working! MongoDB connected and document created successfully");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function post auth/signup(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid JSON");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
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
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Missing email, password, or name");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Connect to MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Database connection failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        
        mongodb:Database db = dbResult;
        mongodb:Collection|error collectionResult = db->getCollection("users");
        if (collectionResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Collection access failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        
        mongodb:Collection users = collectionResult;

        // Create user document
        record {
            string email;
            string password;
            string name;
            string createdAt;
            string updatedAt;
        } userDoc = {
            email: email,
            password: password,  // In production, hash this password
            name: name,
            createdAt: time:utcNow().toString(),
            updatedAt: time:utcNow().toString()
        };

        error? insertResult = users->insertOne(userDoc);
        if (insertResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Failed to create user");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Generate simple token
        string token = "token_" + email + "_" + time:utcNow().toString();

        http:Response res = new();
        res.statusCode = 201;
        res.setPayload("User created successfully. Token: " + token);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function post auth/login(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid JSON");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
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
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Missing email or password");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // For now, accept any login (in production, verify against MongoDB)
        // This is a simplified version to get it working

        // Generate simple token
        string token = "token_" + email + "_" + time:utcNow().toString();

        // Return success response
        http:Response res = new();
        res.statusCode = 200;
        res.setPayload("Login successful. Token: " + token);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function get auth/me(http:Request req) returns http:Response|error {
        // For now, return a simple response
        // In production, implement proper token verification
        http:Response res = new();
        res.statusCode = 200;
        res.setPayload("Demo user: demo@example.com");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    // Networking module endpoints
    resource function get networking/status() returns http:Response|error {
        http:Response res = new();
        res.statusCode = 200;
        res.setPayload("Networking modules are active. Available modules: tcp-handshake, dns-resolution, osi-model, subnet-calculator, network-topology. Version: 1.0.0");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function get networking/modules() returns http:Response|error {
        http:Response res = new();
        res.statusCode = 200;
        res.setPayload("Available networking modules: TCP Handshake, DNS Resolution, OSI Model, Subnet Calculator, Network Topology");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    // TCP Handshake Simulation
    resource function post networking/tcp/handshake(http:Request req) returns http:Response|error {
        log:printInfo("TCP Handshake endpoint called");
        
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            log:printError("Invalid JSON payload: " + payloadOrError.message());
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid JSON payload");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        json payload = payloadOrError;
        log:printInfo("Received payload: " + payload.toString());
        
        // Extract fields safely
        string userId = "";
        string step = "";
        string status = "";

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error stepField = payload.step;
        if (stepField is string) {
            step = stepField;
        }
        json|error statusField = payload.status;
        if (statusField is string) {
            status = statusField;
        }

        log:printInfo("Extracted fields - userId: " + userId + ", step: " + step + ", status: " + status);

        if (userId == "" || step == "" || status == "") {
            log:printError("Missing required fields");
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Missing required fields");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Create handshake document
        record {
            string id;
            string userId;
            string step;
            string status;
            string timestamp;
        } handshakeDoc = {
            id: "handshake_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            step: step,
            status: status,
            timestamp: time:utcNow().toString()
        };

        log:printInfo("Created handshake document: " + handshakeDoc.toString());

        // Store in MongoDB
        log:printInfo("Attempting to connect to MongoDB...");
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Database connection failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        log:printInfo("Connected to database: learning_platform");
        
        mongodb:Collection|error collectionResult = dbResult->getCollection("tcp_handshake");
        if (collectionResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Collection access failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        log:printInfo("Got collection: tcp_handshake");
        
        log:printInfo("Attempting to insert document...");
        error? insertResult = collectionResult->insertOne(handshakeDoc);
        
        if (insertResult is error) {
            log:printError("Failed to save handshake data: " + insertResult.message());
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Failed to save handshake data: " + insertResult.message());
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        log:printInfo("Successfully saved handshake data to MongoDB");

        http:Response res = new();
        res.statusCode = 201;
        res.setPayload("TCP handshake data saved successfully. ID: " + handshakeDoc.id);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    // DNS Resolution Simulation
    resource function post networking/dns/resolution(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid JSON payload");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        json payload = payloadOrError;
        
        // Extract fields safely
        string userId = "";
        string domain = "";
        string status = "";

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error domainField = payload.domain;
        if (domainField is string) {
            domain = domainField;
        }
        json|error statusField = payload.status;
        if (statusField is string) {
            status = statusField;
        }

        if (userId == "" || domain == "" || status == "") {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Missing required fields");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Create DNS document
        record {
            string id;
            string userId;
            string domain;
            string status;
            string timestamp;
        } dnsDoc = {
            id: "dns_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            domain: domain,
            status: status,
            timestamp: time:utcNow().toString()
        };

        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Database connection failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection|error collectionResult = dbResult->getCollection("dns_resolution");
        if (collectionResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Collection access failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection collection = collectionResult;
        error? insertResult = collection->insertOne(dnsDoc);
        
        if (insertResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Failed to save DNS resolution data");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        http:Response res = new();
        res.statusCode = 201;
        res.setPayload("DNS resolution data saved successfully. ID: " + dnsDoc.id);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    // Subnet Calculator
    resource function post networking/subnet/calculate(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid JSON payload");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        json payload = payloadOrError;
        
        // Extract fields safely
        string userId = "";
        string ipAddress = "";
        string subnetMask = "";

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error ipField = payload.ipAddress;
        if (ipField is string) {
            ipAddress = ipField;
        }
        json|error maskField = payload.subnetMask;
        if (maskField is string) {
            subnetMask = maskField;
        }

        if (userId == "" || ipAddress == "" || subnetMask == "") {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Missing required fields");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Simple subnet calculation (simplified)
        int? lastDotIndex = ipAddress.lastIndexOf(".");
        if (lastDotIndex is int) {
            string networkAddress = ipAddress.substring(0, lastDotIndex) + ".0";
            string broadcastAddress = ipAddress.substring(0, lastDotIndex) + ".255";
            string firstHost = ipAddress.substring(0, lastDotIndex) + ".1";
            string lastHost = ipAddress.substring(0, lastDotIndex) + ".254";

            // Create subnet document
            record {
                string id;
                string userId;
                string ipAddress;
                string subnetMask;
                string networkAddress;
                string broadcastAddress;
                string firstHost;
                string lastHost;
                string timestamp;
            } subnetDoc = {
                id: "subnet_" + userId + "_" + time:utcNow().toString(),
                userId: userId,
                ipAddress: ipAddress,
                subnetMask: subnetMask,
                networkAddress: networkAddress,
                broadcastAddress: broadcastAddress,
                firstHost: firstHost,
                lastHost: lastHost,
                timestamp: time:utcNow().toString()
            };

            // Store in MongoDB
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                http:Response res = new();
                res.statusCode = 500;
                res.setPayload("Database connection failed");
                res.setHeader("Access-Control-Allow-Origin", "*");
                return res;
            }
            mongodb:Collection|error collectionResult = dbResult->getCollection("subnet_calculations");
            if (collectionResult is error) {
                http:Response res = new();
                res.statusCode = 500;
                res.setPayload("Collection access failed");
                res.setHeader("Access-Control-Allow-Origin", "*");
                return res;
            }
            mongodb:Collection collection = collectionResult;
            error? insertResult = collection->insertOne(subnetDoc);
            
            if (insertResult is error) {
                http:Response res = new();
                res.statusCode = 500;
                res.setPayload("Failed to save subnet calculation");
                res.setHeader("Access-Control-Allow-Origin", "*");
                return res;
            }

            http:Response res = new();
            res.statusCode = 200;
            res.setPayload("Subnet calculation completed successfully. ID: " + subnetDoc.id + ". Network: " + networkAddress + ", Broadcast: " + broadcastAddress);
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        } else {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid IP address format");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
    }

    // Network Topology Builder
    resource function post networking/topology/save(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid JSON payload");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        json payload = payloadOrError;
        
        // Extract fields safely
        string userId = "";
        string name = "";
        json devices = {};
        json connections = {};

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error nameField = payload.name;
        if (nameField is string) {
            name = nameField;
        }
        json|error devicesField = payload.devices;
        if (devicesField is json) {
            devices = devicesField;
        }
        json|error connectionsField = payload.connections;
        if (connectionsField is json) {
            connections = connectionsField;
        }

        if (userId == "" || name == "") {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Missing required fields");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Create topology document with full drag-and-drop support
        record {
            string id;
            string userId;
            string name;
            json devices;
            json connections;
            string timestamp;
        } topologyDoc = {
            id: "topology_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            name: name,
            devices: devices,
            connections: connections,
            timestamp: time:utcNow().toString()
        };

        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Database connection failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection|error collectionResult = dbResult->getCollection("network_topologies");
        if (collectionResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Collection access failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection collection = collectionResult;
        error? insertResult = collection->insertOne(topologyDoc);
        
        if (insertResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Failed to save network topology");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        http:Response res = new();
        res.statusCode = 201;
        res.setPayload("Network topology saved successfully. ID: " + topologyDoc.id);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    // Get user's saved topologies
    resource function get networking/topology/list(string userId) returns http:Response|error {
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Database connection failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection|error collectionResult = dbResult->getCollection("network_topologies");
        if (collectionResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Collection access failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection collection = collectionResult;
        
        map<json> filter = {
            userId: userId
        };
        
        stream<record {}, error?>|error resultStream = collection->find(filter);
        if (resultStream is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Failed to query database");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        
        record {}[] topologies = [];
        
        error? forEachResult = resultStream.forEach(function(record {} topology) {
            topologies.push(topology);
        });
        
        if (forEachResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Failed to retrieve topologies");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        http:Response res = new();
        res.statusCode = 200;
        res.setPayload("Retrieved " + topologies.length().toString() + " topologies for user: " + userId);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    // User Progress Tracking
    resource function post networking/progress/update(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Invalid JSON payload");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        json payload = payloadOrError;
        
        // Extract fields safely
        string userId = "";
        string module = "";
        string topic = "";
        int progress = 0;

        json|error userIdField = payload.userId;
        if (userIdField is string) {
            userId = userIdField;
        }
        json|error moduleField = payload.module;
        if (moduleField is string) {
            module = moduleField;
        }
        json|error topicField = payload.topic;
        if (topicField is string) {
            topic = topicField;
        }
        json|error progressField = payload.progress;
        if (progressField is int) {
            progress = progressField;
        }

        if (userId == "" || module == "" || topic == "") {
            http:Response res = new();
            res.statusCode = 400;
            res.setPayload("Missing required fields");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Create progress document
        record {
            string id;
            string userId;
            string module;
            string topic;
            int progress;
            string status;
            string timestamp;
        } progressDoc = {
            id: "progress_" + userId + "_" + time:utcNow().toString(),
            userId: userId,
            module: module,
            topic: topic,
            progress: progress,
            status: progress >= 100 ? "completed" : "in_progress",
            timestamp: time:utcNow().toString()
        };

        // Store in MongoDB
        mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
        if (dbResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Database connection failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection|error collectionResult = dbResult->getCollection("user_progress");
        if (collectionResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Collection access failed");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }
        mongodb:Collection collection = collectionResult;
        error? insertResult = collection->insertOne(progressDoc);
        
        if (insertResult is error) {
            http:Response res = new();
            res.statusCode = 500;
            res.setPayload("Failed to save progress");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        http:Response res = new();
        res.statusCode = 200;
        res.setPayload("Progress updated successfully. Progress: " + progress.toString() + "%");
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function options .(http:Request req) returns http:Response {
        http:Response res = new();
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res;
    }
}
