import express from 'express';
import { protect } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/admin.js';
import {
  // Song management
  getAllSongs,
  createSong,
  updateSong,
  deleteSong,
  
  // Artist management
  getAllArtists,
  createArtist,
  updateArtist,
  deleteArtist,
  
  // Album management
  getAllAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  
  // User management
  getAllUsers,
  updateUserRole,
  
  // Dashboard
  getDashboardStats
} from '../controllers/admin.controller.js';

const router = express.Router();

// Áp dụng middleware bảo vệ cho tất cả routes
router.use(protect);
router.use(requireAdmin);

// ============ DASHBOARD ROUTES ============
router.get('/stats', getDashboardStats);

// ============ SONG MANAGEMENT ROUTES ============
router.route('/songs')
  .get(getAllSongs)
  .post(createSong);

router.route('/songs/:id')
  .put(updateSong)
  .delete(deleteSong);

// ============ ARTIST MANAGEMENT ROUTES ============
router.route('/artists')
  .get(getAllArtists)
  .post(createArtist);

router.route('/artists/:id')
  .put(updateArtist)
  .delete(deleteArtist);

// ============ ALBUM MANAGEMENT ROUTES ============
router.route('/albums')
  .get(getAllAlbums)
  .post(createAlbum);

router.route('/albums/:id')
  .put(updateAlbum)
  .delete(deleteAlbum);

// ============ USER MANAGEMENT ROUTES ============
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
