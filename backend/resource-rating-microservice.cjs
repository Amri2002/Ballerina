const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const uri = 'mongodb+srv://mohamedashrif325:rqpBqU7bpqO72qkO@cluster0.3591lxr.mongodb.net/';
const client = new MongoClient(uri);

// Connect once at startup
client.connect().then(() => {
    console.log('MongoDB connected for resource rating microservice');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Add or update a resource rating
app.post('/rate-resource/:resourceId', async (req, res) => {
    const resourceId = req.params.resourceId;
    const { userId, rating } = req.body;
    if (!userId || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Missing userId or invalid rating' });
    }
    try {
        const db = client.db('learning_platform');
        const collection = db.collection('resource_ratings');
        const result = await collection.updateOne(
            { resourceId, userId },
            { $set: { resourceId, userId, rating, timestamp: new Date().toISOString() } },
            { upsert: true }
        );
        res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount, upsertedId: result.upsertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all ratings for a resource
app.get('/resource-ratings/:resourceId', async (req, res) => {
    const resourceId = req.params.resourceId;
    try {
        const db = client.db('learning_platform');
        const collection = db.collection('resource_ratings');
        const ratings = await collection.find({ resourceId }).toArray();
        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(4002, () => {
    console.log('Resource rating microservice running on port 4002');
});