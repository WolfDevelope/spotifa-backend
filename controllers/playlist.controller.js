// controllers/playlist.controller.js
import Playlist from '../models/Playlist.js';

// @desc    Get all playlists
// @route   GET /api/playlists
// @access  Public
export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('user', 'username avatar')
      .populate('songs', 'title artist cover');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's playlists
// @route   GET /api/playlists/my
// @access  Private
export const getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate('songs', 'title artist cover');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
  const { name, description, isPublic } = req.body;

  try {
    const playlist = new Playlist({
      name,
      description,
      isPublic: isPublic || true,
      user: req.user._id,
      songs: []
    });

    const createdPlaylist = await playlist.save();
    res.status(201).json(createdPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Public
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('songs', 'title artist cover');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is private and user is not the owner
    if (!playlist.isPublic && playlist.user._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this playlist' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
export const updatePlaylist = async (req, res) => {
  const { name, description, isPublic, songs } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this playlist' });
    }

    playlist.name = name || playlist.name;
    playlist.description = description !== undefined ? description : playlist.description;
    playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;
    
    if (songs) {
      playlist.songs = songs;
    }

    const updatedPlaylist = await playlist.save();
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await playlist.remove();
    res.json({ message: 'Playlist removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
export const addSongToPlaylist = async (req, res) => {
  const { songId } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    // Check if song already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    const updatedPlaylist = await playlist.save();
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if user is the owner
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    playlist.songs = playlist.songs.filter(
      songId => songId.toString() !== req.params.songId
    );

    const updatedPlaylist = await playlist.save();
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};