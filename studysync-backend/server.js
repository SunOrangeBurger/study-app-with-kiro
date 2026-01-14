const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studysync';

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'studysync-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  invite_code: { type: String, required: true, unique: true },
  syllabus: [{
    subject_name: String,
    units: [{
      unit_name: String,
      concepts: [String]
    }]
  }],
  tests: [{
    name: String,
    date: String,
    type: { type: String, enum: ['Quiz', 'Midterm', 'Final'] },
    subject_name: String,
    covered_topics: [String],
    portion: String
  }],
  resources: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: String,
    description: String,
    type: { type: String, enum: ['Website', 'Document', 'YouTube Video'] },
    link: String,
    added_by: String,
    added_at: { type: Date, default: Date.now }
  }],
  pending_resources: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: String,
    description: String,
    type: { type: String, enum: ['Website', 'Document', 'YouTube Video'] },
    link: String,
    added_by: String,
    added_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const progressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  username: { type: String, required: true },
  history: [{
    concept: String, // "Subject||Unit||Concept"
    at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Create indexes for better performance
progressSchema.index({ user_id: 1, group_id: 1 }, { unique: true });
groupSchema.index({ invite_code: 1 });

const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);
const Progress = mongoose.model('Progress', progressSchema);

// Helper function to generate invite code
function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'StudySync Backend is running' });
});

// Authentication Routes
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();
    console.log(`✅ New user registered: ${username}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.user_id = user._id.toString();
    req.session.username = user.username;

    console.log(`✅ User logged in: ${username}`);
    res.json({ success: true, user_id: user._id.toString() });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/logout', (req, res) => {
  const username = req.session.username;
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log(`✅ User logged out: ${username}`);
    res.json({ success: true });
  });
});

app.get('/get-user', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Group Management Routes
app.post('/create-group', requireAuth, async (req, res) => {
  try {
    const { name, syllabus } = req.body;

    if (!name || !syllabus || !Array.isArray(syllabus)) {
      return res.status(400).json({ error: 'Group name and syllabus are required' });
    }

    // Generate unique invite code
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existingGroup = await Group.findOne({ invite_code: inviteCode });
      if (!existingGroup) {
        isUnique = true;
      }
    }

    // Create group
    const group = new Group({
      name,
      owner_id: req.session.user_id,
      members: [req.session.user_id],
      invite_code: inviteCode,
      syllabus,
      tests: [],
      resources: [],
      pending_resources: []
    });

    await group.save();

    // Create initial progress entry for the owner
    const progress = new Progress({
      user_id: req.session.user_id,
      group_id: group._id,
      username: req.session.username,
      history: []
    });

    await progress.save();

    console.log(`✅ Group created: ${name} by ${req.session.username}`);
    res.json({ success: true, group_id: group._id.toString() });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

app.post('/join-group', requireAuth, async (req, res) => {
  try {
    const { invite_code } = req.body;

    if (!invite_code) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    // Find group by invite code
    const group = await Group.findOne({ invite_code: invite_code.toUpperCase() });
    if (!group) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if user is already a member
    if (group.members.includes(req.session.user_id)) {
      return res.json({ success: true, group_id: group._id.toString() });
    }

    // Add user to group
    group.members.push(req.session.user_id);
    await group.save();

    // Create progress entry for the new member
    const progress = new Progress({
      user_id: req.session.user_id,
      group_id: group._id,
      username: req.session.username,
      history: []
    });

    await progress.save();

    // Emit member joined event
    io.to(group._id.toString()).emit('member_joined', {
      username: req.session.username,
      group_name: group.name
    });

    console.log(`✅ User ${req.session.username} joined group: ${group.name}`);
    res.json({ success: true, group_id: group._id.toString() });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

app.get('/group/:id', requireAuth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.session.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
});

app.get('/user-groups', requireAuth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.session.user_id });
    res.json(groups);
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
});

// Progress Tracking Routes
app.post('/update-progress', requireAuth, async (req, res) => {
  try {
    const { group_id, concept, status } = req.body;

    if (!group_id || !concept || typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Group ID, concept, and status are required' });
    }

    // Verify user is member of the group
    const group = await Group.findById(group_id);
    if (!group || !group.members.includes(req.session.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find or create progress document
    let progress = await Progress.findOne({
      user_id: req.session.user_id,
      group_id: group_id
    });

    if (!progress) {
      progress = new Progress({
        user_id: req.session.user_id,
        group_id: group_id,
        username: req.session.username,
        history: []
      });
    }

    if (status) {
      // Mark as completed - add to history if not already there
      const existingEntry = progress.history.find(entry => entry.concept === concept);
      if (!existingEntry) {
        progress.history.push({ concept, at: new Date() });
      }
    } else {
      // Mark as uncompleted - remove from history
      progress.history = progress.history.filter(entry => entry.concept !== concept);
    }

    await progress.save();

    // Emit progress update to group members
    io.to(group_id).emit('progress_update', {
      username: req.session.username,
      concept: concept,
      action: status ? 'completed' : 'uncompleted',
      timestamp: new Date()
    });

    console.log(`✅ Progress updated: ${req.session.username} ${status ? 'completed' : 'uncompleted'} ${concept}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

app.get('/progress/:group_id', requireAuth, async (req, res) => {
  try {
    const { group_id } = req.params;

    // Verify user is member of the group
    const group = await Group.findById(group_id);
    if (!group || !group.members.includes(req.session.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = await Progress.findOne({
      user_id: req.session.user_id,
      group_id: group_id
    });

    res.json(progress ? progress.history : []);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Resource Management Routes
app.post('/add-resource', requireAuth, async (req, res) => {
  try {
    const { group_id, title, description, type, link } = req.body;

    if (!group_id || !title || !description || !type || !link) {
      return res.status(400).json({ error: 'All resource fields are required' });
    }

    const group = await Group.findById(group_id);
    if (!group || !group.members.includes(req.session.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const resource = {
      title,
      description,
      type,
      link,
      added_by: req.session.username,
      added_at: new Date()
    };

    // If user is owner, add directly to resources, otherwise to pending
    if (group.owner_id.toString() === req.session.user_id) {
      group.resources.push(resource);
    } else {
      group.pending_resources.push(resource);
    }

    await group.save();

    // Emit resource added event
    io.to(group_id).emit('resource_added', {
      username: req.session.username,
      resource_title: title,
      is_pending: group.owner_id.toString() !== req.session.user_id
    });

    console.log(`✅ Resource added: ${title} by ${req.session.username}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Add resource error:', error);
    res.status(500).json({ error: 'Failed to add resource' });
  }
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('join_group', (data) => {
    const { group_id } = data;
    socket.join(group_id);
    console.log(`👥 User ${socket.id} joined group: ${group_id}`);
  });

  socket.on('leave_group', (data) => {
    const { group_id } = data;
    socket.leave(group_id);
    console.log(`👋 User ${socket.id} left group: ${group_id}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 StudySync Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
  console.log(`🌐 Frontend URL: http://localhost:5173`);
});