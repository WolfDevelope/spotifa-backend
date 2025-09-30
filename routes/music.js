import express from 'express';
import {
  getAllSongs,
  getSongById,
  getTrendingSongs,
  getNewReleases,
  getWeeklyTopSongs,
  getMusicVideos,
  getAllArtists,
  getArtistById,
  getPopularArtists,
  getAllAlbums,
  getAlbumById,
  getTopAlbums,
  getNewAlbums,
  getAllPlaylists,
  getMoodPlaylists,
  getGenrePlaylists,
  incrementPlayCount
} from '../controllers/musicController.js';

const router = express.Router();

// Song routes
router.get('/songs', getAllSongs);
router.get('/songs/trending', getTrendingSongs);
router.get('/songs/new-releases', getNewReleases);
router.get('/songs/weekly-top', getWeeklyTopSongs);
router.get('/songs/videos', getMusicVideos);
router.get('/songs/:id', getSongById);
router.post('/songs/:id/play', incrementPlayCount);

// Artist routes
router.get('/artists', getAllArtists);
router.get('/artists/popular', getPopularArtists);
router.get('/artists/:id', getArtistById);

// Album routes
router.get('/albums', getAllAlbums);
router.get('/albums/top', getTopAlbums);
router.get('/albums/new', getNewAlbums);
router.get('/albums/:id', getAlbumById);

// Playlist routes
router.get('/playlists', getAllPlaylists);
router.get('/playlists/mood', getMoodPlaylists);
router.get('/playlists/genres', getGenrePlaylists);

export default router;
