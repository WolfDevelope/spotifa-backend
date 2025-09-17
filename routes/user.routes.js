import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleFavorite,
  getFavorites
} from '../controllers/user.controller.js';
import { protect, admin } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes for favorites (specific routes first)
router.get('/me/favorites', protect, getFavorites);
router.put('/me/favorites/:songId', protect, toggleFavorite);

// Public routes
router.get('/:id', getUserById);

// Admin routes
router.get('/', protect, admin, getUsers);
router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;