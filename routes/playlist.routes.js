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
router.get('/:id', getPlaylistById);

// Protected routes
router.use(protect);
router.get('/my/playlists', getMyPlaylists);
router.post('/', createPlaylist);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

export default router;