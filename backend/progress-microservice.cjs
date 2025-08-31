const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const uri = 'mongodb+srv://mohamedashrif325:rqpBqU7bpqO72qkO@cluster0.3591lxr.mongodb.net/';
const client = new MongoClient(uri);

app.post('/update-progress', async (req, res) => {
    const { userId, completedModules } = req.body;
    if (!userId || !Array.isArray(completedModules)) {
        return res.status(400).json({ error: 'Missing userId or completedModules' });
    }
    try {
        await client.connect();
        const db = client.db('learning_platform');
        const collection = db.collection('user_progress');
        const result = await collection.updateOne(
            { userId },
            { $set: { completedModules, lastUpdated: new Date().toISOString() } },
            { upsert: true }
        );
        res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount, upsertedId: result.upsertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await client.close();
    }
});

app.listen(4001, () => {
    console.log('Progress microservice running on port 4001');
});
