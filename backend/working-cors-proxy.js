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

// Proxy networking endpoints
app.post('/api/networking/tcp/handshake', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/tcp/handshake';
        console.log(`🔄 Proxying POST /api/networking/tcp/handshake to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for TCP handshake`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying TCP handshake:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.post('/api/networking/dns/resolution', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/dns/resolution';
        console.log(`🔄 Proxying POST /api/networking/dns/resolution to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for DNS resolution`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying DNS resolution:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.post('/api/networking/subnet/calculate', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/subnet/calculate';
        console.log(`🔄 Proxying POST /api/networking/subnet/calculate to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for subnet calculation`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying subnet calculation:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.post('/api/networking/topology/save', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/topology/save';
        console.log(`🔄 Proxying POST /api/networking/topology/save to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for topology save`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying topology save:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.get('/api/networking/topology/list/:userId', async (req, res) => {
    try {
        const targetUrl = `http://localhost:3001/api/networking/topology/list/${req.params.userId}`;
        console.log(`🔄 Proxying GET /api/networking/topology/list/${req.params.userId} to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            }
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for topology list`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying topology list:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.post('/api/networking/progress/update', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/progress/update';
        console.log(`🔄 Proxying POST /api/networking/progress/update to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for progress update`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying progress update:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Add missing networking endpoints
app.post('/api/networking/protocol/analyze', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/protocol/analyze';
        console.log(`🔄 Proxying POST /api/networking/protocol/analyze to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for protocol analyze`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying protocol analyze:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.post('/api/networking/performance/monitor', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/performance/monitor';
        console.log(`🔄 Proxying POST /api/networking/performance/monitor to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for performance monitor`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying performance monitor:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.get('/api/networking/analytics/user/:userId', async (req, res) => {
    try {
        const targetUrl = `http://localhost:3001/api/networking/analytics/user/${req.params.userId}`;
        console.log(`🔄 Proxying GET /api/networking/analytics/user/${req.params.userId} to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            }
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for analytics user`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying analytics user:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.get('/api/networking/status', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/status';
        console.log(`🔄 Proxying GET /api/networking/status to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            }
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for networking status`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying networking status:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

app.get('/api/networking/modules', async (req, res) => {
    try {
        const targetUrl = 'http://localhost:3001/api/networking/modules';
        console.log(`🔄 Proxying GET /api/networking/modules to ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
            }
        });
        
        const data = await response.json();
        console.log(`✅ Response: ${response.status} for networking modules`);
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`❌ Error proxying networking modules:`, error);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Generic GET proxy for /api/*
app.get('/api/*', async (req, res) => {
    const targetUrl = `http://localhost:3001${req.originalUrl}`;
    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Generic POST proxy for /api/*
app.post('/api/*', async (req, res) => {
    const targetUrl = `http://localhost:3001${req.originalUrl}`;
    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
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
