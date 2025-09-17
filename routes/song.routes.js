import express from 'express';
import { getAllSongs, getSongById, createSong, updateSong, deleteSong } from '../controllers/song.controller.js';
import { protect, admin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

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