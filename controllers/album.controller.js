import Album from '../models/Album.js';

export const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate('artist', 'name avatar');
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('artist', 'name avatar');
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAlbum = async (req, res) => {
  const { name, artist, year, genre } = req.body;
  const cover = req.file ? `/uploads/images/${req.file.filename}` : '';

  try {
    const album = new Album({
      name,
      artist,
      cover,
      year,
      genre
    });

    const newAlbum = await album.save();
    res.status(201).json(newAlbum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    const updates = { ...req.body };
    if (req.file) {
      updates.cover = `/uploads/images/${req.file.filename}`;
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(updatedAlbum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: 'Album not found' });

    // TODO: Delete associated cover image if needed

    await album.remove();
    res.json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAlbumsByArtist = async (req, res) => {
  try {
    const albums = await Album.find({ artist: req.params.artistId })
      .populate('artist', 'name avatar');
    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};