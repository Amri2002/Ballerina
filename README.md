# CodeVista - Learning Platform

A modern learning platform built with React, TypeScript, Ballerina, and MongoDB.

## 🚀 Features

- **Modern UI**: Built with React, TypeScript, and shadcn/ui components
- **Secure Authentication**: JWT-based authentication with password hashing
- **Ballerina Backend**: High-performance backend with MongoDB integration
- **Real-time CORS Proxy**: Handles cross-origin requests seamlessly
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation

### Backend
- **Ballerina 2201.12.7** (Swan Lake Update 12)
- **MongoDB** for data storage
- **JWT** for authentication
- **CORS Proxy** for cross-origin requests

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Ballerina** 2201.12.7 (Swan Lake Update 12)
- **MongoDB** (Community Server or Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Ballerina
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Set Up MongoDB

Choose one of the following options:

#### Option A: MongoDB Community Server (Recommended for Development)

1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get your connection string
3. Update the connection string in `backend/src/main.bal`

### 5. Start the Backend Services

#### Windows (Easy Way)
```bash
cd backend
start-backend.bat
```

#### Manual Start
```bash
# Terminal 1: Start Ballerina Backend
cd backend
bal run

# Terminal 2: Start CORS Proxy
cd backend
node working-cors-proxy.js
```

### 6. Start the Frontend

```bash
# In a new terminal (from project root)
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **CORS Proxy**: http://localhost:3002

## 📁 Project Structure

```
Ballerina/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   └── config/            # Configuration
├── backend/               # Backend source code
│   ├── src/
│   │   └── main.bal       # Ballerina main file
│   ├── working-cors-proxy.js  # CORS proxy
│   └── Ballerina.toml     # Ballerina configuration
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## 🔐 Authentication

The application uses JWT-based authentication with the following endpoints:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires token)

### Example API Usage

```bash
# Sign up
curl -X POST http://localhost:3002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get current user
curl -X GET http://localhost:3002/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "unique-user-id",
  "email": "user@example.com",
  "password": "hashed-password",
  "name": "User Name",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3002/api
VITE_APP_NAME=CodeVista
VITE_APP_VERSION=1.0.0
```

### Backend Configuration

Update `backend/src/main.bal` for production:

```ballerina
// Change JWT secret
const string JWT_SECRET = "your-production-secret-key";

// Update MongoDB connection for Atlas
mongodb:Client mongoClient = check new ("mongodb+srv://username:password@cluster.mongodb.net");
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running: `net start MongoDB`
   - Check if port 27017 is available: `netstat -an | findstr 27017`

2. **Ballerina Compilation Errors**
   - Verify Ballerina version: `bal -v`
   - Clean and rebuild: `bal clean && bal build`

3. **CORS Errors**
   - Ensure CORS proxy is running on port 3002
   - Check frontend is using correct API URL

4. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node -v`

### Useful Commands

```bash
# Check all services
net start MongoDB
bal -v
node -v
npm -v

# Restart services
bal clean && bal run
npm run dev

# Check ports
netstat -an | findstr 27017
netstat -an | findstr 3001
netstat -an | findstr 3002
netstat -an | findstr 5173
```

## 🚀 Deployment

### Frontend Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment

```bash
cd backend
bal build
# Deploy the generated .jar file
```

### Environment Variables for Production

```bash
export MONGO_URI="your-production-mongodb-uri"
export JWT_SECRET="your-production-jwt-secret"
export NODE_ENV="production"
```

## 📝 Development

### Adding New Features

1. **Frontend**: Add components in `src/components/`
2. **Pages**: Add pages in `src/pages/`
3. **API**: Add endpoints in `backend/src/main.bal`
4. **Database**: Update schema as needed

### Code Style

- **Frontend**: Follow TypeScript best practices
- **Backend**: Follow Ballerina coding conventions
- **Database**: Use consistent naming conventions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the MongoDB setup guide in `backend/MONGODB_SETUP.md`
3. Check the Ballerina documentation
4. Create an issue with detailed error information

## 🎯 Roadmap

- [ ] Password reset functionality
- [ ] Social login (Google, GitHub)
- [ ] User profiles and avatars
- [ ] Course management system
- [ ] Progress tracking
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
