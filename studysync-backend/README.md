# StudySync Backend Server

A Node.js/Express backend server with MongoDB integration for the StudySync collaborative study platform.

## Features

- **Authentication**: User registration, login, session management
- **Group Management**: Create/join study groups with invite codes
- **Progress Tracking**: Real-time concept completion tracking
- **Resource Sharing**: Collaborative resource management
- **Real-time Updates**: WebSocket integration with Socket.IO
- **MongoDB Integration**: Complete database schema and operations

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

3. **Start MongoDB** (if using local installation):
   ```bash
   mongod
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Server will be running at:**
   ```
   http://localhost:3000
   ```

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. Use default URI: `mongodb://localhost:27017/studysync`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studysync
   ```

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /get-user` - Get current user info

### Group Management
- `POST /create-group` - Create new study group
- `POST /join-group` - Join group with invite code
- `GET /group/:id` - Get group details
- `GET /user-groups` - Get user's groups

### Progress Tracking
- `POST /update-progress` - Update concept completion
- `GET /progress/:group_id` - Get user progress for group

### Resources
- `POST /add-resource` - Add study resource

### Health Check
- `GET /health` - Server health status

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (bcrypt hash),
  createdAt: Date,
  updatedAt: Date
}
```

### Groups Collection
```javascript
{
  _id: ObjectId,
  name: String,
  owner_id: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  invite_code: String (unique),
  syllabus: [Subject],
  tests: [Test],
  resources: [Resource],
  pending_resources: [Resource],
  createdAt: Date,
  updatedAt: Date
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  group_id: ObjectId (ref: Group),
  username: String,
  history: [{
    concept: String, // "Subject||Unit||Concept"
    at: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## WebSocket Events

### Client → Server
- `join_group` - Join group room for real-time updates
- `leave_group` - Leave group room

### Server → Client
- `progress_update` - User completed/uncompleted a concept
- `resource_added` - New resource added to group
- `member_joined` - New member joined group

## Development

### Scripts
- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret key for session encryption
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Testing the API

You can test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -c cookies.txt

# Get user info (requires login)
curl http://localhost:3000/get-user -b cookies.txt
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **Session Management**: Express sessions with secure cookies
- **CORS Protection**: Configured for frontend origin
- **Input Validation**: Request body validation
- **Authentication Middleware**: Protected routes

## Production Deployment

1. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=your-production-mongodb-uri
   export SESSION_SECRET=your-secure-session-secret
   ```

2. **Use process manager:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name studysync-backend
   ```

3. **Set up reverse proxy** (nginx/Apache) for HTTPS

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity for Atlas

2. **CORS Errors**
   - Verify frontend URL in CORS configuration
   - Check if credentials are being sent

3. **Session Issues**
   - Ensure SESSION_SECRET is set
   - Check cookie settings for your domain

### Logs
The server logs all important operations:
- User registration/login
- Group creation/joining
- Progress updates
- WebSocket connections

## License

MIT License - see LICENSE file for details.