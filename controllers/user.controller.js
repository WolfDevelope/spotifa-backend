import User from '../models/User.js';
import Playlist from '../models/Playlist.js';

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('playlists', 'name cover')
      .populate('favoriteSongs', 'title artist cover');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, email, role } = req.body;
    user.username = username || user.username;
    user.email = email || user.email;
    if (role) user.role = role;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's playlists
    await Playlist.deleteMany({ user: user._id });

    await user.remove();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite song
// @route   PUT /api/users/favorites/:songId
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favoriteSongs.includes(songId);
    
    if (isFavorite) {
      // Remove from favorites
      user.favoriteSongs = user.favoriteSongs.filter(id => id.toString() !== songId);
    } else {
      // Add to favorites
      user.favoriteSongs.push(songId);
    }

    await user.save();
    
    res.json({ 
      success: true, 
      isFavorite: !isFavorite,
      favoriteSongs: user.favoriteSongs 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('favoriteSongs');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      success: true, 
      favoriteSongs: user.favoriteSongs || [] 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};