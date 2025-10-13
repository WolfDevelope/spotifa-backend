import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';
import User from '../models/User.js';

// ============ SONG MANAGEMENT ============

// @desc Get all songs for admin
// @route GET /api/admin/songs
// @access Private/Admin
export const getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log(`🎵 Admin API - Getting songs for page ${page}, limit ${limit}, skip ${skip}`);

    const songs = await Song.find()
      .populate('artist', 'name avatar')
      .populate('album', 'name cover')
      .sort({ _id: -1 }) // Sử dụng _id làm primary sort để đảm bảo unique ordering
      .skip(skip)
      .limit(limit);

    const total = await Song.countDocuments();

    console.log(`🎵 Admin API - Found ${songs.length} songs, total: ${total}`);
    console.log(`🎵 Admin API - Song IDs: ${songs.map(s => s._id.toString().slice(-6)).join(', ')}`);

    res.status(200).json({
      success: true,
      data: songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all songs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Create new song
// @route POST /api/admin/songs
// @access Private/Admin
export const createSong = async (req, res) => {
  try {
    const songData = {
      ...req.body,
      createdBy: req.user._id
    };

    const song = await Song.create(songData);
    await song.populate('artist', 'name avatar');
    await song.populate('album', 'name cover');

    res.status(201).json({
      success: true,
      data: song,
      message: 'Song created successfully'
    });
  } catch (error) {
    console.error('Create song error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Update song
// @route PUT /api/admin/songs/:id
// @access Private/Admin
export const updateSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('artist', 'name avatar').populate('album', 'name cover');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.status(200).json({
      success: true,
      data: song,
      message: 'Song updated successfully'
    });
  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Delete song
// @route DELETE /api/admin/songs/:id
// @access Private/Admin
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ ARTIST MANAGEMENT ============

// @desc Get all artists for admin
// @route GET /api/admin/artists
// @access Private/Admin
export const getAllArtists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log(`🎨 Admin API - Getting artists for page ${page}, limit ${limit}, skip ${skip}`);

    const artists = await Artist.find()
      .sort({ _id: -1 }) // Sử dụng _id làm primary sort để đảm bảo unique ordering
      .skip(skip)
      .limit(limit);

    const total = await Artist.countDocuments();

    console.log(`🎨 Admin API - Found ${artists.length} artists, total: ${total}`);
    console.log(`🎨 Admin API - Artist IDs: ${artists.map(a => a._id.toString().slice(-6)).join(', ')}`);

    res.status(200).json({
      success: true,
      data: artists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all artists error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Create new artist
// @route POST /api/admin/artists
// @access Private/Admin
export const createArtist = async (req, res) => {
  try {
    const artist = await Artist.create(req.body);

    res.status(201).json({
      success: true,
      data: artist,
      message: 'Artist created successfully'
    });
  } catch (error) {
    console.error('Create artist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Update artist
// @route PUT /api/admin/artists/:id
// @access Private/Admin
export const updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.status(200).json({
      success: true,
      data: artist,
      message: 'Artist updated successfully'
    });
  } catch (error) {
    console.error('Update artist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Delete artist
// @route DELETE /api/admin/artists/:id
// @access Private/Admin
export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Artist deleted successfully'
    });
  } catch (error) {
    console.error('Delete artist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ ALBUM MANAGEMENT ============

// @desc Get all albums for admin
// @route GET /api/admin/albums
// @access Private/Admin
export const getAllAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log(`💿 Admin API - Getting albums for page ${page}, limit ${limit}, skip ${skip}`);

    const albums = await Album.find()
      .populate('artist', 'name avatar')
      .sort({ _id: -1 }) // Sử dụng _id làm primary sort để đảm bảo unique ordering
      .skip(skip)
      .limit(limit);

    const total = await Album.countDocuments();

    console.log(`💿 Admin API - Found ${albums.length} albums, total: ${total}`);
    console.log(`💿 Admin API - Album IDs: ${albums.map(a => a._id.toString().slice(-6)).join(', ')}`);

    res.status(200).json({
      success: true,
      data: albums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all albums error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Create new album
// @route POST /api/admin/albums
// @access Private/Admin
export const createAlbum = async (req, res) => {
  try {
    console.log('💿 Creating album with data:', req.body);
    
    const album = await Album.create(req.body);
    await album.populate('artist', 'name avatar');

    console.log('💿 Album created successfully:', album._id);

    res.status(201).json({
      success: true,
      data: album,
      message: 'Album created successfully'
    });
  } catch (error) {
    console.error('💿 Create album error:', error);
    
    // More detailed error handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc Update album
// @route PUT /api/admin/albums/:id
// @access Private/Admin
export const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('artist', 'name avatar');

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    res.status(200).json({
      success: true,
      data: album,
      message: 'Album updated successfully'
    });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Delete album
// @route DELETE /api/admin/albums/:id
// @access Private/Admin
export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Album deleted successfully'
    });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ USER MANAGEMENT ============

// @desc Get all users for admin
// @route GET /api/admin/users
// @access Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Update user role
// @route PUT /api/admin/users/:id/role
// @access Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'artist', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, artist, or admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Delete user
// @route DELETE /api/admin/users/:id
// @access Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============ DASHBOARD STATS ============

// @desc Get admin dashboard statistics
// @route GET /api/admin/stats
// @access Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [songCount, artistCount, albumCount, userCount] = await Promise.all([
      Song.countDocuments(),
      Artist.countDocuments(),
      Album.countDocuments(),
      User.countDocuments()
    ]);

    // Get recent activities
    const recentSongs = await Song.find()
      .populate('artist', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          songs: songCount,
          artists: artistCount,
          albums: albumCount,
          users: userCount
        },
        recentActivities: {
          songs: recentSongs,
          users: recentUsers
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
