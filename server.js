import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDirs = ['uploads/images', 'uploads/music'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://spotifa.vercel.app'  // Thêm domain production
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
import authRoutes from './routes/auth.routes.js';
import songRoutes from './routes/song.routes.js';
import albumRoutes from './routes/album.routes.js';
import artistRoutes from './routes/artist.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import userRoutes from './routes/user.routes.js';
import musicRoutes from './routes/music.js';
import adminRoutes from './routes/admin.routes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/admin', adminRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error values
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});