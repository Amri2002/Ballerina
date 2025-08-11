import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;

// JWT configuration
const string JWT_SECRET = "your-super-secret-jwt-key-change-in-production";

listener http:Listener httpListener = new (3001);

// MongoDB client for local database
mongodb:ConnectionConfig config = {
    connection: "mongodb+srv://mohamedashrif325:rqpBqU7bpqO72qkO@cluster0.3591lxr.mongodb.net/"
};
mongodb:Client mongoClient = check new (config);

service /api on httpListener {

    resource function post auth/signup(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new ();
            res.statusCode = 400;
            res.setPayload({"error": "Invalid JSON"});
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
            http:Response res = new ();
            res.statusCode = 400;
            res.setPayload({"error": "Missing email, password, or name"});
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Connect to MongoDB
        mongodb:Database db = check mongoClient->getDatabase("learning_platform");
        mongodb:Collection users = check db->getCollection("users");

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
            http:Response res = new ();
            res.statusCode = 500;
            res.setPayload({"error": "Failed to create user"});
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // Generate simple token
        string token = "token_" + email + "_" + time:utcNow().toString();

        http:Response res = new ();
        res.statusCode = 201;
        res.setPayload({
            token: token,
            user: {
                id: email,
                email: email,
                name: name,
                createdAt: userDoc.createdAt,
                updatedAt: userDoc.updatedAt
            }
        });
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function post auth/login(http:Request req) returns http:Response|error {
        json|error payloadOrError = req.getJsonPayload();
        if (payloadOrError is error) {
            http:Response res = new ();
            res.statusCode = 400;
            res.setPayload({"error": "Invalid JSON"});
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
            http:Response res = new ();
            res.statusCode = 400;
            res.setPayload({"error": "Missing email or password"});
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res;
        }

        // For now, accept any login (in production, verify against MongoDB)
        // This is a simplified version to get it working

        // Generate simple token
        string token = "token_" + email + "_" + time:utcNow().toString();

        // Return success response
        http:Response res = new ();
        res.statusCode = 200;
        res.setPayload({
            token: token,
            user: {
                id: email,
                email: email,
                name: "User",
                createdAt: time:utcNow().toString(),
                updatedAt: time:utcNow().toString()
            }
        });
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function get auth/me(http:Request req) returns http:Response|error {
        // For now, return a simple response
        // In production, implement proper token verification
        http:Response res = new ();
        res.statusCode = 200;
        res.setPayload({
            id: "demo-user",
            email: "demo@example.com",
            name: "Demo User",
            createdAt: time:utcNow().toString(),
            updatedAt: time:utcNow().toString()
        });
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    resource function options .(http:Request req) returns http:Response {
        http:Response res = new ();
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res;
    }
}
