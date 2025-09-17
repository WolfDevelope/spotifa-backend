// test-connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Đã kết nối tới MongoDB Atlas');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối:', err);
    process.exit(1);
  });