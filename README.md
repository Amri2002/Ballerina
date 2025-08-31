# CodeVista - Interactive Learning Platform

A comprehensive learning platform built with React + TypeScript frontend and Ballerina backend, featuring interactive modules for networking, databases, DSA, and more.

## 🏗️ Project Architecture

```
CodeVista/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # UI components and modules
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API services
│   │   └── contexts/       # React contexts
│   └── package.json
├── backend/                  # Ballerina backend
│   ├── modules/            # Backend modules
│   ├── main.bal            # Main entry point
│   └── Ballerina.toml      # Ballerina configuration
└── README.md
```

## 🚀 Features

- **Networking Module**: TCP handshake simulation, DNS resolution, subnet calculator, network topology designer
- **Database Module**: ER diagram designer, SQL query builder, learning resources
- **DSA Module**: Data structures and algorithms challenges with interactive playground
- **Forum**: Community discussion platform
- **Authentication**: JWT-based user authentication
- **Progress Tracking**: Learning analytics and progress monitoring

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **bun**
- **Ballerina** (v2201.12.7 or higher)
- **MongoDB** (local or Atlas cloud)

### Optional
- **Git** for version control
- **VS Code** with Ballerina extension

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd CodeVista
```

### 2. Install Frontend Dependencies
```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Install Ballerina Dependencies
```bash
cd backend
bal build
```

## ⚙️ Environment Configuration

### Frontend Environment
create .env in main folder and 
VITE_API_BASE_URL=http://localhost:3002/api
VITE_APP_NAME=CodeVista
VITE_APP_VERSION=1.0.0

### Backend Environment
Edit `backend/config.bal` to configure your environment:

```ballerina
// Configuration file for the learning platform backend
// Database configuration
public const string MONGODB_CONNECTION_STRING = "mongodb+srv://mohamedashrif325:rqpBqU7bpqO72qkO@cluster0.3591lxr.mongodb.net/";
public const string DATABASE_NAME = "learning_platform";

// JWT configuration
public const string JWT_SECRET = "your-super-secret-jwt-key-change-in-production";

// Server configuration
public const int SERVER_PORT = 3001;
```

### MongoDB Setup
1. **Local MongoDB**: Install and start MongoDB service
2. **MongoDB Atlas**: Create a cluster and get connection string
3. Update the connection string in `backend/config.bal`

## 🚀 Running the Project

### Option 1: Quick Start (Windows)
Use the provided batch script for Windows:

```bash
cd backend
npm run dev

in another terminal
cd backend
bal run
```

This will automatically start:
- Ballerina backend on port 3001
- CORS proxy on port 3002



#### Start Frontend
```bash
# In a new terminal (from project root)
npm run dev
# or
yarn dev
# or
bun dev
```



## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:8080 | React application |
| Backend API | http://localhost:3001 | Ballerina backend |
| CORS Proxy | http://localhost:3002 | CORS handling proxy |








