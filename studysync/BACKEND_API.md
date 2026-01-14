# StudySync Backend API Documentation

This document outlines the required backend API endpoints for the StudySync frontend application.

## Base URL
```
http://localhost:3000
```

## Authentication

All API requests should include credentials (cookies) for session management.

### POST /register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /login
Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "string"
}
```

### POST /logout
End user session.

**Response:**
```json
{
  "success": true
}
```

### GET /get-user
Get current authenticated user information.

**Response:**
```json
{
  "_id": "string",
  "username": "string"
}
```

## Group Management

### POST /create-group
Create a new study group.

**Request Body:**
```json
{
  "name": "string",
  "syllabus": [
    {
      "subject_name": "string",
      "units": [
        {
          "unit_name": "string",
          "concepts": ["string"]
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "group_id": "string"
}
```

### POST /join-group
Join an existing group using invite code.

**Request Body:**
```json
{
  "invite_code": "string"
}
```

**Response:**
```json
{
  "success": true,
  "group_id": "string"
}
```

### GET /group/:id
Get group details by ID.

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "owner_id": "string",
  "members": ["string"],
  "invite_code": "string",
  "syllabus": [
    {
      "subject_name": "string",
      "units": [
        {
          "unit_name": "string",
          "concepts": ["string"]
        }
      ]
    }
  ],
  "tests": [
    {
      "name": "string",
      "date": "YYYY-MM-DD",
      "type": "Quiz|Midterm|Final",
      "subject_name": "string",
      "covered_topics": ["string"],
      "portion": "string"
    }
  ],
  "resources": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "type": "Website|Document|YouTube Video",
      "link": "string",
      "added_by": "string",
      "added_at": "Date"
    }
  ],
  "pending_resources": []
}
```

### GET /user-groups
Get all groups the current user belongs to.

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "owner_id": "string",
    "members": ["string"],
    "invite_code": "string",
    "syllabus": [],
    "tests": [],
    "resources": [],
    "pending_resources": []
  }
]
```

## Progress Tracking

### POST /update-progress
Update user's progress on a concept.

**Request Body:**
```json
{
  "group_id": "string",
  "concept": "Subject||Unit||Concept",
  "status": true
}
```

**Response:**
```json
{
  "success": true
}
```

### GET /progress/:group_id
Get user's progress for a specific group.

**Response:**
```json
[
  {
    "concept": "Subject||Unit||Concept",
    "at": "Date"
  }
]
```

## Resources

### POST /add-resource
Add a new resource to a group.

**Request Body:**
```json
{
  "group_id": "string",
  "title": "string",
  "description": "string",
  "type": "Website|Document|YouTube Video",
  "link": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /approve-resource
Approve a pending resource (group owner only).

**Request Body:**
```json
{
  "group_id": "string",
  "resource_id": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST /reject-resource
Reject a pending resource (group owner only).

**Request Body:**
```json
{
  "group_id": "string",
  "resource_id": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

## WebSocket Events

The backend should support Socket.IO for real-time features.

### Client Events
- `join_group`: Join a group room for real-time updates
- `leave_group`: Leave a group room

### Server Events
- `progress_update`: Broadcast when a user updates their progress
- `resource_added`: Broadcast when a new resource is added
- `member_joined`: Broadcast when a new member joins the group

### Example WebSocket Event Data

**progress_update:**
```json
{
  "username": "string",
  "concept": "Subject||Unit||Concept",
  "action": "completed|uncompleted",
  "timestamp": "Date"
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: string,
  password: string // bcrypt hash
}
```

### Groups Collection
```javascript
{
  _id: ObjectId,
  name: string,
  owner_id: ObjectId,
  members: [ObjectId],
  invite_code: string, // hex token
  syllabus: [/* Subject objects */],
  tests: [/* Test objects */],
  resources: [/* Resource objects */],
  pending_resources: [/* Resource objects */]
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  group_id: ObjectId,
  username: string,
  history: [
    {
      concept: string, // "Subject||Unit||Concept"
      at: Date
    }
  ]
}
```

## Error Handling

All endpoints should return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (not logged in)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

Error responses should include a descriptive message:
```json
{
  "error": "Descriptive error message"
}
```

## CORS Configuration

The backend should be configured to accept requests from the frontend origin with credentials:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```