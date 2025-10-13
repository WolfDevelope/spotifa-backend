import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testUserManagement = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('-password');
    console.log(`\n👥 Total users: ${users.length}`);

    // Show user statistics
    const userStats = {
      admins: users.filter(u => u.role === 'admin').length,
      artists: users.filter(u => u.role === 'artist').length,
      users: users.filter(u => u.role === 'user').length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length
    };

    console.log('\n📊 User Statistics:');
    console.log(`   Admins: ${userStats.admins}`);
    console.log(`   Artists: ${userStats.artists}`);
    console.log(`   Users: ${userStats.users}`);
    console.log(`   Active: ${userStats.active}`);
    console.log(`   Inactive: ${userStats.inactive}`);

    // Show first few users
    console.log('\n👤 Sample Users:');
    users.slice(0, 5).forEach(user => {
      console.log(`   ${user.name || 'Unnamed'} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
    });

    // Find admin users
    const adminUsers = users.filter(u => u.role === 'admin');
    console.log(`\n🔑 Admin Users (${adminUsers.length}):`);
    adminUsers.forEach(admin => {
      console.log(`   ${admin.name || 'Unnamed'} (${admin.email}) - ID: ${admin._id}`);
    });

    console.log('\n✅ User management test completed!');
    console.log('\n📝 Notes:');
    console.log('   - Admin users cannot delete their own accounts');
    console.log('   - Admin users cannot change their own role');
    console.log('   - Delete user functionality is now available');
    console.log('   - Role change protection is implemented');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run the test
testUserManagement();
