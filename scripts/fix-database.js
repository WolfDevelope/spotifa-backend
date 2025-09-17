import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;
    
    // Check if username index exists
    const indexes = await db.collection('users').indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));
    
    // Drop username index if it exists
    const usernameIndex = indexes.find(idx => idx.name === 'username_1');
    if (usernameIndex) {
      await db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index');
    }
    
    // Remove any users with null username
    const result = await db.collection('users').deleteMany({ username: null });
    console.log(`Removed ${result.deletedCount} users with null username`);
    
    console.log('Database fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
};

fixDatabase();
