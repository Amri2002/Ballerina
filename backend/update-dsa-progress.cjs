const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const uri = 'mongodb+srv://mohamedashrif325:rqpBqU7bpqO72qkO@cluster0.3591lxr.mongodb.net/';
const client = new MongoClient(uri);

// DSA progress update endpoint

app.post('/update-dsa-progress', async (req, res) => {
    const { userId, completedModules } = req.body;
    if (!userId || !Array.isArray(completedModules)) {
        return res.status(400).json({ error: 'Missing userId or completedModules', success: false });
    }
    try {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }
        const db = client.db('learning_platform');
        const collection = db.collection('dsa_user_progress');
        const result = await collection.updateOne(
            { userId },
            { $set: { completedModules, lastUpdated: new Date().toISOString() } },
            { upsert: true }
        );
        res.json({ success: true, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount, upsertedId: result.upsertedId });
    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found', success: false });
});

app.listen(4003, () => {
    console.log('DSA Progress microservice running on port 4003');
});
