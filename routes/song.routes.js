import express from 'express';
import { getAllSongs, getSongById, createSong, updateSong, deleteSong, uploadSong } from '../controllers/song.controller.js';
import { protect, admin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { upload as cloudinaryUpload } from '../config/cloudinary.js';

const router = express.Router();

// Upload song to Cloudinary (single file upload)
// Chỉ cần protect, không cần admin để test
router.post('/upload', protect, cloudinaryUpload.single('song'), uploadSong);

router.route('/')
  .get(getAllSongs)
  .post(protect, admin, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'song', maxCount: 1 }
  ]), createSong);

router.route('/:id')
  .get(getSongById)
  .put(protect, admin, updateSong)
  .delete(protect, admin, deleteSong);

export default router;