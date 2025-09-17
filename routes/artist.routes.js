import express from 'express';
import {
  getArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
  getTopArtists
} from '../controllers/artist.controller.js';
import { protect, admin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.route('/')
  .get(getArtists)
  .post(protect, admin, upload.single('avatar'), createArtist);

router.route('/top')
  .get(getTopArtists);

router.route('/:id')
  .get(getArtistById)
  .put(protect, admin, upload.single('avatar'), updateArtist)
  .delete(protect, admin, deleteArtist);

export default router;