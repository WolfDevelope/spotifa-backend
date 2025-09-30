// Quick script to create admin user
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Simple User schema for this script
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/spotifa', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@spotifa.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@spotifa.com');
      console.log('Password: admin123456');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: 'admin@spotifa.com',
      password: 'admin123456',
      name: 'Admin User',
      role: 'admin',
      isEmailVerified: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@spotifa.com');
    console.log('🔑 Password: admin123456');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
