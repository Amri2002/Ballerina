import ballerina/http;
import ballerina/log;


// Resource rating record type
public type ResourceRating record {
    string resourceId;
    string userId;
    int rating; // 1-5 stars
    string timestamp;
};

// Add a rating for a resource
public function post_resource_rating(http:Request req, string resourceId) returns http:Response|error {
    json|error payloadOrError = req.getJsonPayload();
    if (payloadOrError is error) {
        return createResponse(400, "Invalid JSON", "Invalid JSON payload");
    }
    json payload = payloadOrError;
    string userId = "anonymous";
    int rating = 0;
    json|error userIdField = payload.userId;
    if (userIdField is string) { userId = userIdField; }
    json|error ratingField = payload.rating;
    if (ratingField is int) { rating = ratingField; }
    if (rating < 1 || rating > 5) {
        return createResponse(400, "Invalid rating value", "Rating must be between 1 and 5");
    }
    http:Client|error clientOrError = new("http://localhost:4002");
    if (clientOrError is http:Client) {
        json reqBody = { userId: userId, rating: rating };
        http:Response|error respOrError = clientOrError->post("/rate-resource/" + resourceId, reqBody);
        if (respOrError is http:Response) {
            json|error respJson = respOrError.getJsonPayload();
            if (respJson is json) {
                log:printInfo("Resource rating microservice response: " + respJson.toString());
                return createResponse(respOrError.statusCode, "Rating added/updated", null);
            } else {
                log:printError("Resource rating microservice error: " + respJson.message());
                return createResponse(500, "Microservice error", respJson.message());
            }
        } else {
            log:printError("Resource rating microservice HTTP error: " + respOrError.message());
            return createResponse(500, "Microservice HTTP error", respOrError.message());
        }
    } else {
        log:printError("Failed to create HTTP client: " + clientOrError.message());
        return createResponse(500, "Microservice client error", clientOrError.message());
    }
}

// Get all ratings for a resource
public function get_resource_ratings(http:Request req, string resourceId) returns http:Response|error {
    http:Client|error clientOrError = new("http://localhost:4002");
    if (clientOrError is http:Client) {
        http:Response|error respOrError = clientOrError->get("/resource-ratings/" + resourceId);
        if (respOrError is http:Response) {
            json|error respJson = respOrError.getJsonPayload();
            if (respJson is json) {
                log:printInfo("Resource rating microservice response: " + respJson.toString());
                return createResponse(200, respJson.toString(), null);
            } else {
                log:printError("Resource rating microservice error: " + respJson.message());
                return createResponse(500, "Microservice error", respJson.message());
            }
        } else {
            log:printError("Resource rating microservice HTTP error: " + respOrError.message());
            return createResponse(500, "Microservice HTTP error", respOrError.message());
        }
    } else {
        log:printError("Failed to create HTTP client: " + clientOrError.message());
        return createResponse(500, "Microservice client error", clientOrError.message());
    }
}

// Resource record type definition
public type Resource record {
    string id;
    string title;
    string description;
    string url;
    string category;
    string subject;
    string addedBy;
    string timestamp;
};

// Utility function for CORS responses
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

// List all resources
public function get_resources(http:Request req) returns http:Response|error {
    http:Client|error clientOrError = new("http://localhost:4003");
    if (clientOrError is http:Client) {
        http:Response|error respOrError = clientOrError->get("/resources");
        if (respOrError is http:Response) {
            json|error respJson = respOrError.getJsonPayload();
            if (respJson is json) {
                log:printInfo("Resource microservice response: " + respJson.toString());
                return createResponse(200, respJson.toString(), null);
            } else {
                log:printError("Resource microservice error: " + respJson.message());
                return createResponse(500, "Microservice error", respJson.message());
            }
        } else {
            log:printError("Resource microservice HTTP error: " + respOrError.message());
            return createResponse(500, "Microservice HTTP error", respOrError.message());
        }
    } else {
        log:printError("Failed to create HTTP client: " + clientOrError.message());
        return createResponse(500, "Microservice client error", clientOrError.message());
    }
}

// Add a new resource
public function post_resource(http:Request req) returns http:Response|error {
    json|error payloadOrError = req.getJsonPayload();
    if (payloadOrError is error) {
        return createResponse(400, "Invalid JSON", "Invalid JSON payload");
    }
    json payload = payloadOrError;
    http:Client|error clientOrError = new("http://localhost:4003");
    if (clientOrError is http:Client) {
        http:Response|error respOrError = clientOrError->post("/resources", payload);
        if (respOrError is http:Response) {
            json|error respJson = respOrError.getJsonPayload();
            if (respJson is json) {
                log:printInfo("Resource microservice response: " + respJson.toString());
                return createResponse(respOrError.statusCode, respJson.toString(), null);
            } else {
                log:printError("Resource microservice error: " + respJson.message());
                return createResponse(500, "Microservice error", respJson.message());
            }
        } else {
            log:printError("Resource microservice HTTP error: " + respOrError.message());
            return createResponse(500, "Microservice HTTP error", respOrError.message());
        }
    } else {
        log:printError("Failed to create HTTP client: " + clientOrError.message());
        return createResponse(500, "Microservice client error", clientOrError.message());
    }
}
