import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import Playlist from '../models/Playlist.js';

// @desc    Get all songs with pagination and filters
// @route   GET /api/music/songs
// @access  Public
export const getAllSongs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, genre, mediaType, artist, album } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { lyrics: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre) query.genre = genre;
    if (mediaType) query.mediaType = mediaType;
    if (artist) query.artist = artist;
    if (album) query.album = album;

    const songs = await Song.find(query)
      .populate('artist', 'name avatar')
      .populate('album', 'name cover year')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Song.countDocuments(query);

    res.json({
      success: true,
      data: songs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single song by ID
// @route   GET /api/music/songs/:id
// @access  Public
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist', 'name avatar bio')
      .populate('album', 'name cover year');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.json({
      success: true,
      data: song
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get trending songs
// @route   GET /api/music/trending
// @access  Public
export const getTrendingSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .populate('artist', 'name avatar')
      .populate('album', 'name cover')
      .sort({ plays: -1 })
      .limit(10);

    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get new releases
// @route   GET /api/music/new-releases
// @access  Public
export const getNewReleases = async (req, res) => {
  try {
    const songs = await Song.find()
      .populate('artist', 'name avatar')
      .populate('album', 'name cover')
      .sort({ releaseDate: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get weekly top songs
// @route   GET /api/music/weekly-top
// @access  Public
export const getWeeklyTopSongs = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const songs = await Song.find({
      createdAt: { $gte: oneWeekAgo }
    })
      .populate('artist', 'name avatar')
      .populate('album', 'name cover')
      .sort({ plays: -1 })
      .limit(5);

    res.json({
      success: true,
      data: songs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get music videos
// @route   GET /api/music/videos
// @access  Public
export const getMusicVideos = async (req, res) => {
  try {
    const videos = await Song.find({ mediaType: 'video' })
      .populate('artist', 'name avatar')
      .populate('album', 'name cover')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all artists
// @route   GET /api/music/artists
// @access  Public
export const getAllArtists = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const artists = await Artist.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ followers: -1 });

    const total = await Artist.countDocuments(query);

    res.json({
      success: true,
      data: artists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single artist by ID
// @route   GET /api/music/artists/:id
// @access  Public
export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.json({
      success: true,
      data: artist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get popular artists
// @route   GET /api/music/artists/popular
// @access  Public
export const getPopularArtists = async (req, res) => {
  try {
    const artists = await Artist.find()
      .sort({ followers: -1 })
      .limit(6);

    res.json({
      success: true,
      data: artists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all albums
// @route   GET /api/music/albums
// @access  Public
export const getAllAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, year, type } = req.query;
    
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (year) query.year = year;
    if (type) query.albumType = type;

    const albums = await Album.find(query)
      .populate('artist', 'name avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1 });

    const total = await Album.countDocuments(query);

    res.json({
      success: true,
      data: albums,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single album by ID
// @route   GET /api/music/albums/:id
// @access  Public
export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('artist', 'name avatar');

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    res.json({
      success: true,
      data: album
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get top albums
// @route   GET /api/music/albums/top
// @access  Public
export const getTopAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ albumType: 'album' })
      .populate('artist', 'name avatar')
      .sort({ year: -1 })
      .limit(5);

    res.json({
      success: true,
      data: albums
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get new albums
// @route   GET /api/music/albums/new
// @access  Public
export const getNewAlbums = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const albums = await Album.find({ 
      year: { $gte: currentYear - 1 },
      albumType: 'album'
    })
      .populate('artist', 'name avatar')
      .sort({ year: -1 })
      .limit(10);

    res.json({
      success: true,
      data: albums
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all playlists
// @route   GET /api/music/playlists
// @access  Public
export const getAllPlaylists = async (req, res) => {
  try {
    const { type, category } = req.query;
    
    let query = { isPublic: true };
    if (type) query.type = type;
    if (category) query.category = category;

    const playlists = await Playlist.find(query)
      .populate('songs', 'title artist cover duration')
      .populate({
        path: 'songs',
        populate: {
          path: 'artist',
          select: 'name'
        }
      })
      .sort({ followers: -1 });

    res.json({
      success: true,
      data: playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get mood playlists
// @route   GET /api/music/playlists/mood
// @access  Public
export const getMoodPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ type: 'mood' })
      .sort({ followers: -1 });

    res.json({
      success: true,
      data: playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get genre playlists
// @route   GET /api/music/playlists/genres
// @access  Public
export const getGenrePlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ type: 'genre' })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Increment song play count
// @route   POST /api/music/songs/:id/play
// @access  Public
export const incrementPlayCount = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.json({
      success: true,
      data: { plays: song.plays }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
