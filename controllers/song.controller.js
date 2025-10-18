import Song from '../models/Song.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

// Upload song file to Cloudinary
export const uploadSong = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, artist, album, genre, lyrics, duration, durationSec } = req.body;

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, 'spotifa/songs');

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to cloud storage'
      });
    }

    // Prepare song data - handle empty fields properly
    const songData = {
      title: title || 'Untitled',
      artist,
      src: uploadResult.url,
      cloudinary_public_id: uploadResult.public_id,
      cover: req.body.cover || null,
      duration: duration || '3:45',
      durationSec: parseInt(durationSec) || 225,
      mediaType: 'audio'
    };

    // Only add optional fields if they have values
    if (album && album.trim() !== '' && album !== 'undefined') {
      songData.album = album;
    }
    
    if (genre && genre.trim() !== '') {
      songData.genre = genre;
    }
    
    if (lyrics && lyrics.trim() !== '') {
      songData.lyrics = lyrics;
    }

    // Create song record
    const song = new Song(songData);

    await song.save();

    res.status(201).json({
      success: true,
      data: song,
      message: 'Song uploaded successfully'
    });

  } catch (error) {
    console.error('Upload song error:', error);
    console.error('Error details:', error.message);
    console.error('Request body:', req.body);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy tất cả bài hát
export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().populate('artist', 'name avatar').populate('album', 'name cover');
    res.json({
      success: true,
      data: songs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Lấy bài hát theo ID
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist', 'name avatar')
      .populate('album', 'name cover');
    if (!song) return res.status(404).json({
      success: false,
      message: 'Song not found'
    });
    res.json({
      success: true,
      data: song
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Tạo bài hát mới (chỉ admin)
export const createSong = async (req, res) => {
  const { title, artist, album, duration, durationSec, lyrics, genre } = req.body;
  const cover = req.files?.cover ? `/uploads/images/${req.files.cover[0].filename}` : null;
  const src = req.files?.song ? `/uploads/music/${req.files.song[0].filename}` : null;

  try {
    const song = new Song({
      title,
      artist,
      album,
      cover,
      src,
      duration,
      durationSec,
      lyrics,
      genre
    });

    const newSong = await song.save();
    res.status(201).json({
      success: true,
      data: newSong
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Cập nhật bài hát (chỉ admin)
export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({
      success: false,
      message: 'Song not found'
    });

    // Update fields
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      song[key] = updates[key];
    });

    await song.save();
    res.json({
      success: true,
      data: song
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Xóa bài hát (chỉ admin)
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({
      success: false,
      message: 'Song not found'
    });

    // Delete from Cloudinary if exists
    if (song.cloudinary_public_id) {
      await deleteFromCloudinary(song.cloudinary_public_id);
    }

    await song.remove();
    res.json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};