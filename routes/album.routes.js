import express from 'express';
import { 
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumsByArtist
} from '../controllers/album.controller.js';
import { protect, admin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.route('/')
  .get(getAlbums)
  .post(protect, admin, upload.single('cover'), createAlbum);

router.route('/:id')
  .get(getAlbumById)
  .put(protect, admin, upload.single('cover'), updateAlbum)
  .delete(protect, admin, deleteAlbum);

router.get('/artist/:artistId', getAlbumsByArtist);

export default router;