import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;

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

// Forum: Delete a thread (only by author)
public function delete_forum_thread(http:Request req, string id, mongodb:Client mongoClient) returns http:Response|error {
	json|error payloadOrError = req.getJsonPayload();
	string requester = "";
	if (payloadOrError is json) {
		json payload = payloadOrError;
		json|error authorField = payload.author;
		if (authorField is string) { requester = authorField; }
	}
	mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
	if (dbResult is error) {
		return createResponse(500, "Database connection failed", dbResult.message());
	}
	mongodb:Database db = dbResult;
	mongodb:Collection|error collectionResult = db->getCollection("forum_threads");
	if (collectionResult is error) {
		return createResponse(500, "Collection access failed", collectionResult.message());
	}
	mongodb:Collection threadsCollection = collectionResult;
	stream<record {}, error?>|error findResult = threadsCollection->find({ id: id });
	if (findResult is error) {
		return createResponse(500, "Database query failed", findResult.message());
	}
	stream<record {}, error?> resultStream = findResult;
	record {}[] threadArr = [];
	error? forEachResult = resultStream.forEach(function(record {} value) {
		threadArr.push(value);
	});
	if (forEachResult is error) {
		return createResponse(500, "Data processing failed", forEachResult.message());
	}
	if (threadArr.length() == 0) {
		return createResponse(404, "Thread not found", "No thread with given id");
	}
	map<anydata> threadMap = <map<anydata>>threadArr[0];
	string threadAuthor = <string>threadMap["author"];
	if (requester != threadAuthor) {
		return createResponse(403, "Forbidden", "Only the author can delete this thread");
	}
	mongodb:DeleteResult|mongodb:Error deleteResult = threadsCollection->deleteOne({ id: id });
	if (deleteResult is mongodb:Error) {
		return createResponse(500, "Failed to delete thread", deleteResult.message());
	}
	// Optionally delete replies to this thread
	mongodb:Collection|error repliesColResult = db->getCollection("forum_replies");
	if (repliesColResult is mongodb:Collection) {
		mongodb:DeleteResult|mongodb:Error repliesDeleteResult = repliesColResult->deleteMany({ threadId: id });
		// No need to handle error for replies deletion, but you can log if needed
	}
	return createResponse(200, "Thread deleted", null);
}

// Forum: Create a new thread
public function post_forum_thread(http:Request req, mongodb:Client mongoClient) returns http:Response|error {
	json|error payloadOrError = req.getJsonPayload();
	if (payloadOrError is error) {
		return createResponse(400, "Invalid JSON", "Invalid JSON payload");
	}
	json payload = payloadOrError;
	string title = "";
	string content = "";
	string author = "Anonymous";
	json|error titleField = payload.title;
	if (titleField is string) { title = titleField; }
	json|error contentField = payload.content;
	if (contentField is string) { content = contentField; }
	json|error authorField = payload.author;
	if (authorField is string) { author = authorField; }
	if (title == "" || content == "") {
		return createResponse(400, "Missing title or content", "Required fields missing");
	}
	mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
	if (dbResult is error) {
		return createResponse(500, "Database connection failed", dbResult.message());
	}
	mongodb:Database db = dbResult;
	mongodb:Collection|error collectionResult = db->getCollection("forum_threads");
	if (collectionResult is error) {
		return createResponse(500, "Collection access failed", collectionResult.message());
	}
	mongodb:Collection threadsCollection = collectionResult;
	record {|
		string id;
		string title;
		string content;
		string author;
		string timestamp;
	|} threadDoc = {
		id: "thread_" + time:utcNow().toString(),
		title: title,
		content: content,
		author: author,
		timestamp: time:utcNow().toString()
	};
	error? insertResult = threadsCollection->insertOne(threadDoc);
	if (insertResult is error) {
		return createResponse(500, "Failed to create thread", insertResult.message());
	}
	json response = { id: threadDoc.id };
	return createResponse(201, response.toString(), null);
}

// Forum: List all threads
public function get_forum_threads(http:Request req, mongodb:Client mongoClient) returns http:Response|error {
	mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
	if (dbResult is error) {
		return createResponse(500, "Database connection failed", dbResult.message());
	}
	mongodb:Database db = dbResult;
	mongodb:Collection|error collectionResult = db->getCollection("forum_threads");
	if (collectionResult is error) {
		return createResponse(500, "Collection access failed", collectionResult.message());
	}
	mongodb:Collection threadsCollection = collectionResult;
	stream<record {}, error?>|error findResult = threadsCollection->find({});
	if (findResult is error) {
		return createResponse(500, "Database query failed", findResult.message());
	}
	stream<record {}, error?> resultStream = findResult;
	record {}[] threads = [];
	error? forEachResult = resultStream.forEach(function(record {} value) {
		threads.push(value);
	});
	if (forEachResult is error) {
		return createResponse(500, "Data processing failed", forEachResult.message());
	}
	return createResponse(200, (<json>threads).toString(), null);
}

// Forum: Add a reply to a thread
public function post_forum_reply(http:Request req, mongodb:Client mongoClient) returns http:Response|error {
	json|error payloadOrError = req.getJsonPayload();
	if (payloadOrError is error) {
		return createResponse(400, "Invalid JSON", "Invalid JSON payload");
	}
	json payload = payloadOrError;
	string threadId = "";
	string content = "";
	string author = "Anonymous";
	json|error threadIdField = payload.threadId;
	if (threadIdField is string) { threadId = threadIdField; }
	json|error contentField = payload.content;
	if (contentField is string) { content = contentField; }
	json|error authorField = payload.author;
	if (authorField is string) { author = authorField; }
	if (threadId == "" || content == "") {
		return createResponse(400, "Missing threadId or content", "Required fields missing");
	}
	mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
	if (dbResult is error) {
		return createResponse(500, "Database connection failed", dbResult.message());
	}
	mongodb:Database db = dbResult;
	mongodb:Collection|error collectionResult = db->getCollection("forum_replies");
	if (collectionResult is error) {
		return createResponse(500, "Collection access failed", collectionResult.message());
	}
	mongodb:Collection repliesCollection = collectionResult;
	record {|
		string id;
		string threadId;
		string content;
		string author;
		string timestamp;
	|} replyDoc = {
		id: "reply_" + time:utcNow().toString(),
		threadId: threadId,
		content: content,
		author: author,
		timestamp: time:utcNow().toString()
	};
	error? insertResult = repliesCollection->insertOne(replyDoc);
	if (insertResult is error) {
		return createResponse(500, "Failed to add reply", insertResult.message());
	}
	json response = { id: replyDoc.id };
	return createResponse(201, response.toString(), null);
}

// Forum: Get thread details with replies
public function get_forum_thread_details(http:Request req, string id, mongodb:Client mongoClient) returns http:Response|error {
	mongodb:Database|error dbResult = mongoClient->getDatabase("learning_platform");
	if (dbResult is error) {
		return createResponse(500, "Database connection failed", dbResult.message());
	}
	mongodb:Database db = dbResult;
	mongodb:Collection|error threadColResult = db->getCollection("forum_threads");
	if (threadColResult is error) {
		return createResponse(500, "Collection access failed", threadColResult.message());
	}
	mongodb:Collection threadsCollection = threadColResult;
	stream<record {}, error?>|error findThreadResult = threadsCollection->find({ id: id });
	if (findThreadResult is error) {
		return createResponse(500, "Database query failed", findThreadResult.message());
	}
	stream<record {}, error?> threadStream = findThreadResult;
	record {}[] threadArr = [];
	error? forEachThread = threadStream.forEach(function(record {} value) {
		threadArr.push(value);
	});
	if (forEachThread is error) {
		return createResponse(500, "Data processing failed", forEachThread.message());
	}
	if (threadArr.length() == 0) {
		return createResponse(404, "Thread not found", "No thread with given id");
	}
	// Get replies
	mongodb:Collection|error replyColResult = db->getCollection("forum_replies");
	if (replyColResult is error) {
		return createResponse(500, "Collection access failed", replyColResult.message());
	}
	mongodb:Collection repliesCollection = replyColResult;
	stream<record {}, error?>|error findRepliesResult = repliesCollection->find({ threadId: id });
	if (findRepliesResult is error) {
		return createResponse(500, "Database query failed", findRepliesResult.message());
	}
	stream<record {}, error?> repliesStream = findRepliesResult;
	record {}[] repliesArr = [];
	error? forEachReply = repliesStream.forEach(function(record {} value) {
		repliesArr.push(value);
	});
	if (forEachReply is error) {
		return createResponse(500, "Data processing failed", forEachReply.message());
	}
	// Convert thread and replies to json arrays
	json threadJson = {};
	json repliesJson = [];
	if threadArr.length() > 0 {
		threadJson = checkpanic threadArr[0].cloneWithType(json);
	}
	if repliesArr.length() > 0 {
		json[] tempReplies = [];
		foreach var reply in repliesArr {
			tempReplies.push(checkpanic reply.cloneWithType(json));
		}
		repliesJson = tempReplies;
	}
	json response = { "thread": threadJson, "replies": repliesJson };
	return createResponse(200, response.toString(), null);
}
