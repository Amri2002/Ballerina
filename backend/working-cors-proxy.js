import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Proxy signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/auth/signup';
        console.log(`🔄 Proxying POST /api/auth/signup to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for signup`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying signup:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Proxy login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/auth/login';
        console.log(`🔄 Proxying POST /api/auth/login to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for login`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying login:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Proxy me endpoint
app.get('/api/auth/me', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/auth/me';
        console.log(`🔄 Proxying GET /api/auth/me to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for me`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying me:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'CORS Proxy is running' });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`🚀 CORS Proxy running on http://localhost:${PORT}`);
    console.log(`📡 Proxying /api requests to http://localhost:3001`);
    console.log(`🌐 Allowing requests from http://localhost:8080`);
});
