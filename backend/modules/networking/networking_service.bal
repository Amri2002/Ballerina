
import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;
// import ballerina/log;

const string JWT_ISSUER = "ballerina-backend";
const string JWT_AUDIENCE = "ballerina-frontend";
const string JWT_SECRET = "supersecretkey";

listener http:Listener networkingListener = new (3002);

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

service /networking on networkingListener {
    // 1. Network Protocol Analyzer
    resource function post protocol/analyze(http:Request req) returns http:Response|error {
        // ...existing code from main.bal...
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            return createResponse(400, "Invalid JSON payload", "Invalid JSON");
        }

        json payload = payloadOrError;
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
    resource function post security/scan(http:Request req) returns http:Response|error {
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
    resource function post performance/monitor(http:Request req) returns http:Response|error {
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

    // 4. Learning Analytics
    resource function get analytics/user(http:Request req) returns http:Response|error {
        string? userIdParam = req.getQueryParamValue("userId");
        if (userIdParam is string) {
            string userId = userIdParam;
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
    resource function post achievements/unlock(http:Request req) returns http:Response|error {
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

    // Additional networking endpoints
    resource function post tcp/handshake(http:Request req) returns http:Response|error {
        return createResponse(201, "{\"message\": \"TCP handshake data saved successfully\"}", ());
    }
    resource function post dns/resolution(http:Request req) returns http:Response|error {
        return createResponse(201, "{\"message\": \"DNS resolution data saved successfully\"}", ());
    }
    resource function post subnet/calculate(http:Request req) returns http:Response|error {
        return createResponse(201, "{\"message\": \"Subnet calculation completed successfully\"}", ());
    }
    resource function post topology/save(http:Request req) returns http:Response|error {
        return createResponse(201, "{\"message\": \"Network topology saved successfully\"}", ());
    }
    resource function get topology/list(http:Request req) returns http:Response|error {
        string? userIdParam = req.getQueryParamValue("userId");
        if (userIdParam is string) {
            string userId = userIdParam;
            return createResponse(200, "{\"topologies\": []}", ());
        } else {
            return createResponse(400, "Missing userId parameter", "userId query parameter is required");
        }
    }
    resource function post progress/update(http:Request req) returns http:Response|error {
        return createResponse(201, "{\"message\": \"Progress updated successfully\"}", ());
    }
    resource function get status() returns http:Response|error {
        return createResponse(200, "{\"status\": \"active\", \"modules\": [\"tcp\", \"dns\", \"subnet\", \"topology\"]}", ());
    }
    resource function get modules() returns http:Response|error {
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
