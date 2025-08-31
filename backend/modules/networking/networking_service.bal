
import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;
import ballerina/log;

// Enhanced data models for networking modules
type TCPHandshakeSession record {
    string id;
    string userId;
    string sessionId;
    string status; // "active", "completed", "failed"
    string[] completedSteps;
    json stepDetails;
    string startTime;
    string endTime;
    int totalSteps;
    int currentStep;
    json performance;
};

type DNSResolutionSession record {
    string id;
    string userId;
    string domain;
    string status;
    json resolutionPath;
    string[] queries;
    string startTime;
    string endTime;
    int responseTime;
    json cache;
};

type SubnetCalculation record {
    string id;
    string userId;
    string ipAddress;
    string subnetMask;
    string cidr;
    json calculation;
    string timestamp;
    boolean isCorrect;
    json userAnswer;
};

type NetworkTopology record {
    string id;
    string userId;
    string name;
    string topologyType;
    json devices;
    json connections;
    json configuration;
    string status;
    string createdAt;
    string updatedAt;
    json simulationResults;
    json failureScenarios;
};

type LearningProgress record {
    string id;
    string userId;
    string module;
    string topic;
    int progress;
    string[] completedExercises;
    json scores;
    string lastAccessed;
    int timeSpent;
    json achievements;
};

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

// Helper: Calculate subnet information
function calculateSubnetInfo(string ipAddress, string subnetMask, string cidr) returns json {
    // Parse IP address and subnet mask using Ballerina string operations
    string[] ipParts = [];
    string[] maskParts = [];
    
    // Split IP address by dots
    int startIndex = 0;
    int? dotIndex = ipAddress.indexOf(".", startIndex);
    while (dotIndex is int && dotIndex != -1) {
        ipParts.push(ipAddress.substring(startIndex, dotIndex));
        startIndex = dotIndex + 1;
        dotIndex = ipAddress.indexOf(".", startIndex);
    }
    ipParts.push(ipAddress.substring(startIndex));
    
    // Split subnet mask by dots
    startIndex = 0;
    dotIndex = subnetMask.indexOf(".", startIndex);
    while (dotIndex is int && dotIndex != -1) {
        maskParts.push(subnetMask.substring(startIndex, dotIndex));
        startIndex = dotIndex + 1;
        dotIndex = subnetMask.indexOf(".", startIndex);
    }
    maskParts.push(subnetMask.substring(startIndex));
    
    int[] ipOctets = [];
    int[] maskOctets = [];
    
    foreach string part in ipParts {
        int|error octet = int:fromString(part);
        if (octet is int) {
            ipOctets.push(octet);
        } else {
            // Default to 0 if parsing fails
            ipOctets.push(0);
        }
    }
    
    foreach string part in maskParts {
        int|error octet = int:fromString(part);
        if (octet is int) {
            maskOctets.push(octet);
        } else {
            // Default to 0 if parsing fails
            maskOctets.push(0);
        }
    }
    
    // Ensure we have 4 octets
    while (ipOctets.length() < 4) {
        ipOctets.push(0);
    }
    while (maskOctets.length() < 4) {
        maskOctets.push(0);
    }
    
    // Calculate network address (IP AND mask)
    int[] networkOctets = [];
    if (ipOctets.length() >= 4 && maskOctets.length() >= 4) {
        networkOctets.push(ipOctets[0] & maskOctets[0]);
        networkOctets.push(ipOctets[1] & maskOctets[1]);
        networkOctets.push(ipOctets[2] & maskOctets[2]);
        networkOctets.push(ipOctets[3] & maskOctets[3]);
    }
    
    // Calculate wildcard mask
    int[] wildcardOctets = [];
    if (maskOctets.length() >= 4) {
        wildcardOctets.push(255 - maskOctets[0]);
        wildcardOctets.push(255 - maskOctets[1]);
        wildcardOctets.push(255 - maskOctets[2]);
        wildcardOctets.push(255 - maskOctets[3]);
    }
    
    // Calculate broadcast address (IP OR wildcard)
    int[] broadcastOctets = [];
    if (ipOctets.length() >= 4 && wildcardOctets.length() >= 4) {
        broadcastOctets.push(ipOctets[0] | wildcardOctets[0]);
        broadcastOctets.push(ipOctets[1] | wildcardOctets[1]);
        broadcastOctets.push(ipOctets[2] | wildcardOctets[2]);
        broadcastOctets.push(ipOctets[3] | wildcardOctets[3]);
    }
    
    // Calculate first and last host - create new arrays with modified values
    int[] firstHostOctets = [];
    if (networkOctets.length() >= 4) {
        firstHostOctets.push(networkOctets[0]);
        firstHostOctets.push(networkOctets[1]);
        firstHostOctets.push(networkOctets[2]);
        firstHostOctets.push(networkOctets[3] + 1);
    }
    
    int[] lastHostOctets = [];
    if (broadcastOctets.length() >= 4) {
        lastHostOctets.push(broadcastOctets[0]);
        lastHostOctets.push(broadcastOctets[1]);
        lastHostOctets.push(broadcastOctets[2]);
        lastHostOctets.push(broadcastOctets[3] - 1);
    }
    
    // Calculate total hosts
    int hostBits = 0;
    foreach int octet in wildcardOctets {
        if (octet > 0) {
            hostBits = hostBits + 8;
        }
    }
    int totalHosts = 1 << hostBits;
    int usableHosts = totalHosts - 2;
    
    // Convert arrays to IP strings - with safety checks
    string networkAddress = "";
    string broadcastAddress = "";
    string firstHost = "";
    string lastHost = "";
    string wildcardMask = "";
    
    if (networkOctets.length() >= 4) {
        int firstOctet = networkOctets[0];
        int secondOctet = networkOctets[1];
        int thirdOctet = networkOctets[2];
        int fourthOctet = networkOctets[3];
        networkAddress = firstOctet.toString() + "." + secondOctet.toString() + "." + thirdOctet.toString() + "." + fourthOctet.toString();
    }
    
    if (broadcastOctets.length() >= 4) {
        int firstOctet = broadcastOctets[0];
        int secondOctet = broadcastOctets[1];
        int thirdOctet = broadcastOctets[2];
        int fourthOctet = broadcastOctets[3];
        broadcastAddress = firstOctet.toString() + "." + secondOctet.toString() + "." + thirdOctet.toString() + "." + fourthOctet.toString();
    }
    
    if (firstHostOctets.length() >= 4) {
        int firstOctet = firstHostOctets[0];
        int secondOctet = firstHostOctets[1];
        int thirdOctet = firstHostOctets[2];
        int fourthOctet = firstHostOctets[3];
        firstHost = firstOctet.toString() + "." + secondOctet.toString() + "." + thirdOctet.toString() + "." + fourthOctet.toString();
    }
    
    if (lastHostOctets.length() >= 4) {
        int firstOctet = lastHostOctets[0];
        int secondOctet = lastHostOctets[1];
        int thirdOctet = lastHostOctets[2];
        int fourthOctet = lastHostOctets[3];
        lastHost = firstOctet.toString() + "." + secondOctet.toString() + "." + thirdOctet.toString() + "." + fourthOctet.toString();
    }
    
    if (wildcardOctets.length() >= 4) {
        int firstOctet = wildcardOctets[0];
        int secondOctet = wildcardOctets[1];
        int thirdOctet = wildcardOctets[2];
        int fourthOctet = wildcardOctets[3];
        wildcardMask = firstOctet.toString() + "." + secondOctet.toString() + "." + thirdOctet.toString() + "." + fourthOctet.toString();
    }
    
    int ipClassOctet = 0;
    if (ipOctets.length() > 0) {
        ipClassOctet = ipOctets[0];
    }
    
    return {
        networkAddress: networkAddress,
        broadcastAddress: broadcastAddress,
        firstHost: firstHost,
        lastHost: lastHost,
        subnetMask: subnetMask,
        wildcardMask: wildcardMask,
        totalHosts: totalHosts,
        usableHosts: usableHosts,
        cidr: cidr,
        ipClass: getIPClass(ipClassOctet)
    };
}

// Helper: Determine IP class
function getIPClass(int firstOctet) returns string {
    if (firstOctet >= 1 && firstOctet <= 126) {
        return "A";
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return "B";
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return "C";
    } else if (firstOctet >= 224 && firstOctet <= 239) {
        return "D";
    } else if (firstOctet >= 240 && firstOctet <= 255) {
        return "E";
    } else {
        return "Unknown";
    }
}

// Initialize MongoDB indexes for networking collections
public function createNetworkingIndexes(mongodb:Client mongoClient) {
    mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
    if (dbResult is error) {
        log:printError("Failed to connect to database for networking indexing: " + dbResult.message());
        return;
    }
    
    mongodb:Database db = dbResult;
    
    // Create indexes for better query performance
    string[] collections = ["tcp_sessions", "dns_sessions", "subnet_calculations", "subnet_exercise_progress", "network_topologies", "learning_progress"];
    
    foreach string collectionName in collections {
        mongodb:Collection|error collectionResult = db->getCollection(collectionName);
        if (collectionResult is error) {
            log:printError("Failed to get collection " + collectionName + ": " + collectionResult.message());
            continue;
        }
        
        mongodb:Collection collection = collectionResult;
        
        // Create index on userId for faster queries
        map<json> indexSpec = { userId: 1 };
        error? indexResult = collection->createIndex(indexSpec);
        if (indexResult is error) {
            log:printError("Failed to create index on " + collectionName + ": " + indexResult.message());
        } else {
            log:printInfo("Successfully created index on " + collectionName + " collection");
        }
    }
}

// TCP Handshake: Save session data
public function save_tcp_handshake(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string step = "";
            string status = "";
            json packets = {};
            
            // Extract fields safely
            json|error stepField = payload.step;
            if (stepField is string) {
                step = stepField;
            }
            json|error statusField = payload.status;
            if (statusField is string) {
                status = statusField;
            }
            json|error packetsField = payload.packets;
            if (packetsField is json) {
                packets = packetsField;
            }

            if (step == "") {
                return createResponse(400, "Missing required fields", "step is required");
            }

            // Get or create session
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("tcp_sessions");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            mongodb:Collection tcpCollection = collectionResult;
            
            // Find existing session or create new one
            map<json> filter = { userId: userId, status: "active" };
            stream<record {}, error?>|error findResult = tcpCollection->find(filter);
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
                // Create new session
                TCPHandshakeSession session = {
                    id: "tcp_" + userId + "_" + time:utcNow().toString(),
                    userId: userId,
                    sessionId: "session_" + time:utcNow().toString(),
                    status: "active",
                    completedSteps: [step],
                    stepDetails: { [step]: { status: status, packets: packets, timestamp: time:utcNow().toString() } },
                    startTime: time:utcNow().toString(),
                    endTime: "",
                    totalSteps: 3,
                    currentStep: 1,
                    performance: { startTime: time:utcNow().toString() }
                };
                
                error? insertResult = tcpCollection->insertOne(session);
                if (insertResult is error) {
                    return createResponse(500, "Failed to create TCP session", insertResult.message());
                }
                
                return createResponse(201, "{\"message\": \"TCP session created successfully\", \"sessionId\": \"" + session.sessionId + "\"}", null);
            } else {
                // Update existing session
                map<anydata> sessionMap = <map<anydata>>data[0];
                string sessionId = <string>sessionMap["sessionId"];
                
                // Update step details
                map<json> updateFilter = { sessionId: sessionId };
                map<json> updateFields = {
                    completedSteps: [step],
                    currentStep: 2,
                    stepDetails: { [step]: { status: status, packets: packets, timestamp: time:utcNow().toString() } }
                };
                
                mongodb:Update updateDoc = { "$push": { completedSteps: step }, "$set": updateFields };
                var updateResult = tcpCollection->updateOne(updateFilter, updateDoc);
                if (updateResult is error) {
                    return createResponse(500, "Failed to update TCP session", updateResult.message());
                }
                
                return createResponse(200, "{\"message\": \"TCP session updated successfully\", \"sessionId\": \"" + sessionId + "\"}", null);
            }
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// DNS Resolution: Save resolution data
public function save_dns_resolution(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string domain = "";
            string status = "";
            json queries = {};
            
            // Extract fields safely
            json|error domainField = payload.domain;
            if (domainField is string) {
                domain = domainField;
            }
            json|error statusField = payload.status;
            if (statusField is string) {
                status = statusField;
            }
            json|error queriesField = payload.queries;
            if (queriesField is json) {
                queries = queriesField;
            }

            if (domain == "") {
                return createResponse(400, "Missing required fields", "domain is required");
            }

            DNSResolutionSession session = {
                id: "dns_" + userId + "_" + time:utcNow().toString(),
                userId: userId,
                domain: domain,
                status: status,
                resolutionPath: queries,
                queries: [],
                startTime: time:utcNow().toString(),
                endTime: "",
                responseTime: 0,
                cache: {}
            };

            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("dns_sessions");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            mongodb:Collection dnsCollection = collectionResult;
            error? insertResult = dnsCollection->insertOne(session);
            if (insertResult is error) {
                return createResponse(500, "Failed to save DNS resolution", insertResult.message());
            }
            
            return createResponse(201, "{\"message\": \"DNS resolution data saved successfully\", \"id\": \"" + session.id + "\"}", null);
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Subnet Calculator: Save calculation
public function save_subnet_calculation(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string ipAddress = "";
            string subnetMask = "";
            string cidr = "";
            json userAnswer = {};
            
            // Extract fields safely
            json|error ipField = payload.ipAddress;
            if (ipField is string) {
                ipAddress = ipField;
            }
            json|error maskField = payload.subnetMask;
            if (maskField is string) {
                subnetMask = maskField;
            }
            json|error cidrField = payload.cidr;
            if (cidrField is string) {
                cidr = cidrField;
            }
            json|error answerField = payload.userAnswer;
            if (answerField is json) {
                userAnswer = answerField;
            }

            if (ipAddress == "") {
                return createResponse(400, "Missing required fields", "ipAddress is required");
            }

            // Calculate correct subnet information
            json calculation = calculateSubnetInfo(ipAddress, subnetMask, cidr);

            SubnetCalculation subnetRecord = {
                id: "subnet_" + userId + "_" + time:utcNow().toString(),
                userId: userId,
                ipAddress: ipAddress,
                subnetMask: subnetMask,
                cidr: cidr,
                calculation: calculation,
                timestamp: time:utcNow().toString(),
                isCorrect: true,
                userAnswer: userAnswer
            };

            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("subnet_calculations");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            mongodb:Collection subnetCollection = collectionResult;
            error? insertResult = subnetCollection->insertOne(subnetRecord);
            if (insertResult is error) {
                return createResponse(500, "Failed to save subnet calculation", insertResult.message());
            }
            
            return createResponse(201, "{\"message\": \"Subnet calculation completed successfully\", \"calculation\": " + calculation.toString() + "}", null);
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Network Topology: Save topology
public function save_network_topology(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string name = "";
            json devices = {};
            json connections = {};
            
            // Extract fields safely
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

            if (name == "") {
                return createResponse(400, "Missing required fields", "name is required");
            }

            NetworkTopology topology = {
                id: "topology_" + userId + "_" + time:utcNow().toString(),
                userId: userId,
                name: name,
                topologyType: "custom",
                devices: devices,
                connections: connections,
                configuration: {},
                status: "active",
                createdAt: time:utcNow().toString(),
                updatedAt: time:utcNow().toString(),
                simulationResults: {},
                failureScenarios: {}
            };

            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("network_topologies");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            mongodb:Collection topologyCollection = collectionResult;
            error? insertResult = topologyCollection->insertOne(topology);
            if (insertResult is error) {
                return createResponse(500, "Failed to save network topology", insertResult.message());
            }
            
            return createResponse(201, "{\"message\": \"Network topology saved successfully\", \"id\": \"" + topology.id + "\"}", ());
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Network Topology: Get user's topologies
public function get_network_topologies(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("network_topologies");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            mongodb:Collection topologyCollection = collectionResult;
            
            map<json> filter = { userId: userId };
            stream<record {}, error?>|error findResult = topologyCollection->find(filter);
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
            
            return createResponse(200, "{\"topologies\": " + data.toString() + "}", ());
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Get topology types (static data)
public function get_topology_types() returns http:Response {
    json topologyTypes = [
        { id: "star", name: "Star Topology", description: "All devices connected to a central hub" },
        { id: "bus", name: "Bus Topology", description: "All devices connected to a single cable" },
        { id: "ring", name: "Ring Topology", description: "Devices connected in a circular pattern" },
        { id: "mesh", name: "Mesh Topology", description: "All devices connected to each other" },
        { id: "tree", name: "Tree Topology", description: "Hierarchical network structure" },
        { id: "hybrid", name: "Hybrid Topology", description: "Combination of multiple topologies" }
    ];
    
    return createResponse(200, topologyTypes.toString(), ());
}

// Simulate topology
public function simulate_topology(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string topologyType = "";
            
            // Extract fields safely
            json|error typeField = payload.topologyType;
            if (typeField is string) {
                topologyType = typeField;
            }

            if (topologyType == "") {
                return createResponse(400, "Missing required fields", "topologyType is required");
            }

            // Simulate network performance based on topology type
            json simulationResults = {
                topologyType: topologyType,
                userId: userId,
                timestamp: time:utcNow().toString(),
                performance: {
                    latency: 50,
                    bandwidth: 1000,
                    reliability: 0.99,
                    scalability: 0.8
                },
                devices: [
                    { "id": "device1", "type": "router", "status": "active", "load": 0.3 },
                    { "id": "device2", "type": "switch", "status": "active", "load": 0.5 },
                    { "id": "device3", "type": "host", "status": "active", "load": 0.2 }
                ],
                connections: [
                    { "source": "device1", "target": "device2", "status": "active", "bandwidth": 1000 },
                    { "source": "device2", "target": "device3", "status": "active", "bandwidth": 100 }
                ]
            };

            return createResponse(200, "{\"message\": \"Topology simulation completed\", \"results\": " + simulationResults.toString() + "}", ());
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Test topology failure scenarios
public function test_topology_failure(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string topologyType = "";
            string failureScenario = "";
            
            // Extract fields safely
            json|error typeField = payload.topologyType;
            if (typeField is string) {
                topologyType = typeField;
            }
            json|error scenarioField = payload.failureScenario;
            if (scenarioField is string) {
                failureScenario = scenarioField;
            }

            if (topologyType == "" || failureScenario == "") {
                return createResponse(400, "Missing required fields", "topologyType and failureScenario are required");
            }

            // Simulate failure scenario
            json failureResults = {
                topologyType: topologyType,
                failureScenario: failureScenario,
                userId: userId,
                timestamp: time:utcNow().toString(),
                impact: {
                    affectedDevices: 2,
                    networkPartition: false,
                    recoveryTime: 300,
                    dataLoss: false
                },
                recovery: {
                    automaticRecovery: true,
                    manualIntervention: false,
                    backupPath: true
                }
            };

            return createResponse(200, "{\"message\": \"Failure test completed\", \"results\": " + failureResults.toString() + "}", ());
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Enhanced Progress Tracking
public function update_learning_progress(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string module = "";
            string topic = "";
            int progress = 0;
            
            // Extract fields safely
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

            if (module == "" || topic == "") {
                return createResponse(400, "Missing required fields", "module and topic are required");
            }

            // Update or create progress record
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("learning_progress");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            mongodb:Collection progressCollection = collectionResult;
            
            // Check if progress record exists
            map<json> filter = { userId: userId, module: module, topic: topic };
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
                // Create new progress record
                LearningProgress progressRecord = {
                    id: "progress_" + userId + "_" + module + "_" + topic,
                    userId: userId,
                    module: module,
                    topic: topic,
                    progress: progress,
                    completedExercises: [],
                    scores: {},
                    lastAccessed: time:utcNow().toString(),
                    timeSpent: 0,
                    achievements: {}
                };
                
                error? insertResult = progressCollection->insertOne(progressRecord);
                if (insertResult is error) {
                    return createResponse(500, "Failed to create progress record", insertResult.message());
                }
            } else {
                // Update existing progress record
                map<json> updateFilter = { userId: userId, module: module, topic: topic };
                map<json> updateFields = {
                    progress: progress,
                    lastAccessed: time:utcNow().toString()
                };
                
                mongodb:Update updateDoc = { "$set": updateFields };
                var updateResult = progressCollection->updateOne(updateFilter, updateDoc);
                if (updateResult is error) {
                    return createResponse(500, "Failed to update progress", updateResult.message());
                }
            }
            
            return createResponse(200, "{\"message\": \"Progress updated successfully\", \"progress\": " + progress.toString() + "}", ());
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Get user's learning progress
public function get_learning_progress(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string userId = "";
    
    // First try to get userId from query parameter
    map<string[]> queryParams = req.getQueryParams();
    string[]? userIdParamArray = queryParams["userId"];
    if (userIdParamArray is string[] && userIdParamArray.length() > 0) {
        userId = userIdParamArray[0]; // Take the first value if multiple exist
    } else {
        // Fall back to session-based userId
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if (authHeader is string && authHeader.startsWith("Bearer ")) {
            string token = authHeader.substring(7, authHeader.length());
            map<anydata>? userMapOpt = sessionStore[token];
            if userMapOpt is map<anydata> {
                userId = <string>userMapOpt["id"];
            }
        }
    }
    
    if (userId == "") {
        return createResponse(400, "Missing userId", "userId is required either as query parameter or in authorization token");
    }
            
            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("learning_progress");
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
            
            return createResponse(200, "{\"progress\": " + data.toString() + "}", ());
}

// Get networking status
public function get_networking_status() returns http:Response {
    return createResponse(200, "{\"status\": \"active\", \"modules\": [\"tcp\", \"dns\", \"subnet\", \"topology\"]}", ());
}

// Get networking modules
public function get_networking_modules() returns http:Response {
    return createResponse(200, "[\"tcp\", \"dns\", \"subnet\", \"topology\", \"protocol\", \"security\", \"performance\"]", ());
}

// Subnet Exercise Progress: Save exercise completion
public function save_subnet_exercise_progress(http:Request req, map<map<anydata>> sessionStore, mongodb:Client mongoClient) returns http:Response|error {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
    if (authHeader is string && authHeader.startsWith("Bearer ")) {
        string token = authHeader.substring(7, authHeader.length());
        map<anydata>? userMapOpt = sessionStore[token];
        if userMapOpt is map<anydata> {
            string userId = <string>userMapOpt["id"];
            json|error payloadOrError = req.getJsonPayload();
            if (payloadOrError is error) {
                return createResponse(400, "Invalid JSON payload", "Invalid JSON");
            }

            json payload = payloadOrError;
            string exerciseId = "";
            boolean isCorrect = false;
            json userInputs = {};
            json correctAnswer = {};
            
            // Extract fields safely
            json|error exerciseIdField = payload.exerciseId;
            if (exerciseIdField is string) {
                exerciseId = exerciseIdField;
            }
            json|error isCorrectField = payload.isCorrect;
            if (isCorrectField is boolean) {
                isCorrect = isCorrectField;
            }
            json|error userInputsField = payload.userInputs;
            if (userInputsField is json) {
                userInputs = userInputsField;
            }
            json|error correctAnswerField = payload.correctAnswer;
            if (correctAnswerField is json) {
                correctAnswer = correctAnswerField;
            }

            if (exerciseId == "") {
                return createResponse(400, "Missing required fields", "exerciseId is required");
            }

            // Create exercise progress record
            record {
                string id;
                string userId;
                string exerciseId;
                string module;
                string topic;
                boolean completed;
                boolean isCorrect;
                json userInputs;
                json correctAnswer;
                string timestamp;
                int score;
            } exerciseProgress = {
                id: "exercise_" + userId + "_" + exerciseId + "_" + time:utcNow().toString(),
                userId: userId,
                exerciseId: exerciseId,
                module: "networking",
                topic: "subnet-calculator",
                completed: true,
                isCorrect: isCorrect,
                userInputs: userInputs,
                correctAnswer: correctAnswer,
                timestamp: time:utcNow().toString(),
                score: isCorrect ? 100 : 0
            };

            mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
            if (dbResult is error) {
                return createResponse(500, "Database connection failed", dbResult.message());
            }
            
            mongodb:Database db = dbResult;
            mongodb:Collection|error collectionResult = db->getCollection("subnet_exercise_progress");
            if (collectionResult is error) {
                return createResponse(500, "Collection access failed", collectionResult.message());
            }
            
            mongodb:Collection progressCollection = collectionResult;
            error? insertResult = progressCollection->insertOne(exerciseProgress);
            if (insertResult is error) {
                return createResponse(500, "Failed to save exercise progress", insertResult.message());
            }
            
            // Also update general user progress
            updateUserProgress(userId, "networking", "subnet-calculator", isCorrect ? 100 : 0, mongoClient);
            
            return createResponse(201, "{\"message\": \"Exercise progress saved successfully\", \"exerciseId\": \"" + exerciseId + "\", \"isCorrect\": " + isCorrect.toString() + "}", null);
        } else {
            return createResponse(401, "Invalid token", "Session not found");
        }
    } else {
        return createResponse(401, "Unauthorized", "Missing or invalid authorization header");
    }
}

// Helper: Update user progress
function updateUserProgress(string userId, string module, string topic, int progress, mongodb:Client mongoClient) {
    mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
    if (dbResult is error) {
        log:printError("Failed to connect to database for progress update: " + dbResult.message());
        return;
    }
    
    mongodb:Database db = dbResult;
    mongodb:Collection|error collectionResult = db->getCollection("user_progress");
    if (collectionResult is error) {
        log:printError("Failed to access user_progress collection: " + collectionResult.message());
        return;
    }
    
    mongodb:Collection progressCollection = collectionResult;
    
    // Check if user progress exists
    map<json> filter = { userId: userId };
    stream<record {}, error?>|error findResult = progressCollection->find(filter);
    if (findResult is error) {
        log:printError("Failed to find user progress: " + findResult.message());
        return;
    }
    
    stream<record {}, error?> resultStream = findResult;
    record {}[] data = [];
    error? forEachResult = resultStream.forEach(function(record {} value) {
        data.push(value);
    });
    if (forEachResult is error) {
        log:printError("Failed to process result stream: " + forEachResult.message());
        return;
    }
    
    if (data.length() > 0) {
        // Update existing progress
        map<anydata> progressMap = <map<anydata>>data[0];
        anydata currentProgress = progressMap["progress"];
        if (currentProgress is map<json>) {
            map<json> progressData = <map<json>>currentProgress;
            progressData[module] = { topic: topic, progress: progress, lastUpdated: time:utcNow().toString() };
            
            map<json> updateFilter = { userId: userId };
            mongodb:Update updateDoc = { "$set": { "progress": progressData } };
            var updateResult = progressCollection->updateOne(updateFilter, updateDoc);
            if (updateResult is error) {
                log:printError("Failed to update user progress: " + updateResult.message());
            }
        }
    } else {
        // Create new progress record
        map<json> progressMap = {};
        progressMap[module] = { topic: topic, progress: progress, lastUpdated: time:utcNow().toString() };
        
        record {
            string userId;
            map<json> progress;
            string createdAt;
            string updatedAt;
        } newProgress = {
            userId: userId,
            progress: progressMap,
            createdAt: time:utcNow().toString(),
            updatedAt: time:utcNow().toString()
        };
        
        error? insertResult = progressCollection->insertOne(newProgress);
        if (insertResult is error) {
            log:printError("Failed to create user progress: " + insertResult.message());
        }
    }
}
