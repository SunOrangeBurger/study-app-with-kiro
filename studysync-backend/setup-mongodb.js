const mongoose = require('mongoose');

// MongoDB setup script for StudySync
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studysync';

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Create indexes for better performance
    const db = mongoose.connection.db;
    
    // Users collection indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    console.log('✅ Created index on users.username');

    // Groups collection indexes
    await db.collection('groups').createIndex({ invite_code: 1 }, { unique: true });
    await db.collection('groups').createIndex({ members: 1 });
    console.log('✅ Created indexes on groups collection');

    // Progress collection indexes
    await db.collection('progresses').createIndex({ user_id: 1, group_id: 1 }, { unique: true });
    await db.collection('progresses').createIndex({ group_id: 1 });
    console.log('✅ Created indexes on progress collection');

    console.log('🎉 Database setup completed successfully!');
    console.log('📊 Database name:', db.databaseName);
    console.log('🔗 Connection URI:', MONGODB_URI);

    // Test data creation (optional)
    if (process.argv.includes('--create-test-data')) {
      await createTestData();
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB is running locally');
      console.log('2. For local MongoDB: run "mongod" in terminal');
      console.log('3. For MongoDB Atlas: check your connection string');
      console.log('4. Verify network connectivity');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function createTestData() {
  console.log('\n🔄 Creating test data...');
  
  const bcrypt = require('bcryptjs');
  const crypto = require('crypto');

  // Create test user
  const hashedPassword = await bcrypt.hash('testpass', 10);
  const testUser = {
    username: 'testuser',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    await mongoose.connection.db.collection('users').insertOne(testUser);
    console.log('✅ Created test user: testuser / testpass');

    // Create test group
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const testGroup = {
      name: 'Sample Physics Group',
      owner_id: testUser._id,
      members: [testUser._id],
      invite_code: inviteCode,
      syllabus: [
        {
          subject_name: 'Physics',
          units: [
            {
              unit_name: 'Mechanics',
              concepts: ['Newton\'s Laws', 'Kinematics', 'Energy Conservation']
            },
            {
              unit_name: 'Thermodynamics',
              concepts: ['Heat Transfer', 'Entropy', 'Gas Laws']
            }
          ]
        }
      ],
      tests: [
        {
          name: 'Midterm Exam',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          type: 'Midterm',
          subject_name: 'Physics',
          covered_topics: ['Newton\'s Laws', 'Kinematics'],
          portion: 'Chapters 1-3'
        }
      ],
      resources: [],
      pending_resources: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await mongoose.connection.db.collection('groups').insertOne(testGroup);
    console.log(`✅ Created test group: ${testGroup.name} (Invite: ${inviteCode})`);

    console.log('\n🎉 Test data created successfully!');
    console.log('📝 You can now:');
    console.log('   - Login with: testuser / testpass');
    console.log(`   - Join the group with invite code: ${inviteCode}`);

  } catch (error) {
    if (error.code === 11000) {
      console.log('ℹ️  Test data already exists, skipping...');
    } else {
      console.error('❌ Failed to create test data:', error.message);
    }
  }
}

// Run the setup
if (require.main === module) {
  console.log('🚀 StudySync MongoDB Setup');
  console.log('==========================\n');
  setupDatabase();
}

module.exports = { setupDatabase };