import Song from '../models/Song.js';

// Lấy tất cả bài hát
export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().populate('artist', 'name avatar').populate('album', 'name cover');
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy bài hát theo ID
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist', 'name avatar')
      .populate('album', 'name cover');
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(201).json(newSong);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật bài hát (chỉ admin)
export const updateSong = async (req, res) => {
  // Tương tự như createSong nhưng cần xử lý file cũ nếu có file mới
};

// Xóa bài hát (chỉ admin)
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Xóa file ảnh và nhạc nếu cần
    // ...

    await song.remove();
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};