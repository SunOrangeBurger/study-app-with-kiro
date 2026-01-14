# StudySync - Quick Start Guide

## 🚀 Get StudySync Running in 5 Minutes

### Step 1: Install MongoDB

**Option A: Local MongoDB (Recommended for development)**
1. Download MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB:
   ```bash
   # Windows: MongoDB should start automatically
   # macOS: brew services start mongodb/brew/mongodb-community
   # Linux: sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `.env` file with your connection string

### Step 2: Start the Backend

```bash
# In studysync-backend directory
npm install
npm run setup-with-data  # Sets up database with test data
npm run dev              # Starts server with auto-reload
```

### Step 3: Start the Frontend

```bash
# In studysync directory (separate terminal)
npm run dev
```

### Step 4: Test the Application

1. **Open browser:** http://localhost:5173
2. **Login with test account:**
   - Username: `testuser`
   - Password: `testpass`
3. **Or register a new account**

## 🎯 What You Can Do Now

### ✅ Fully Working Features:
- **User Registration & Login**
- **Create Study Groups** with dynamic syllabus
- **Join Groups** with invite codes
- **Track Progress** with neon checkboxes
- **Smart Priority System** for concepts
- **Real-time Updates** via WebSocket
- **Countdown Widget** for upcoming tests
- **Responsive Design** on all devices

### 📊 Test Data Included:
- Sample user: `testuser` / `testpass`
- Sample Physics group with invite code
- Sample test scheduled for next week
- Complete syllabus with concepts

## 🔧 Troubleshooting

### Backend Issues:
```bash
# Check if MongoDB is running
mongosh  # Should connect without errors

# Check server logs
npm run dev  # Look for connection messages
```

### Frontend Issues:
```bash
# Check if backend is running
curl http://localhost:3000/health

# Should return: {"status":"OK","message":"StudySync Backend is running"}
```

### Common Solutions:
1. **MongoDB Connection Error**: Make sure MongoDB is running
2. **CORS Error**: Backend and frontend URLs must match configuration
3. **Session Issues**: Clear browser cookies and try again

## 🌟 Key Features to Test

1. **Smart Priority System:**
   - Create a group with syllabus
   - Add a test with covered topics
   - See concepts automatically prioritized

2. **Real-time Collaboration:**
   - Open two browser windows
   - Login as different users in same group
   - Mark concepts complete - see updates in real-time

3. **Countdown Widget:**
   - Groups with tests within 7 days show countdown
   - Priority topics are highlighted
   - Updates every second

4. **Responsive Design:**
   - Test on mobile, tablet, desktop
   - All features work across screen sizes

## 📱 Next Steps

- **Invite Friends:** Share group invite codes
- **Add More Content:** Create comprehensive syllabi
- **Schedule Tests:** Add upcoming exams
- **Share Resources:** Add study materials
- **Track Progress:** Complete concepts and see priorities update

## 🎉 You're All Set!

StudySync is now fully functional with MongoDB integration. The smart priority system, real-time collaboration, and beautiful UI are all working together to create an amazing study experience!

**Happy Studying! 📚✨**