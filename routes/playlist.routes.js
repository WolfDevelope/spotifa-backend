// routes/playlist.routes.js
import express from 'express';
import {
  getPlaylists,
  getMyPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} from '../controllers/playlist.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPlaylists);

// Protected routes (specific routes first)
router.get('/my', protect, getMyPlaylists);

// Public routes (dynamic routes last)
router.get('/:id', getPlaylistById);

// Other protected routes
router.use(protect);
router.post('/', createPlaylist);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

export default router;