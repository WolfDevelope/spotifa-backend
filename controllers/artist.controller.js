import Artist from '../models/Artist.js';

export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ name: 1 });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createArtist = async (req, res) => {
  const { name, bio } = req.body;
  const avatar = req.file ? `/uploads/images/${req.file.filename}` : '';

  try {
    const artist = new Artist({
      name,
      bio,
      avatar
    });

    const newArtist = await artist.save();
    res.status(201).json(newArtist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateArtist = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.avatar = `/uploads/images/${req.file.filename}`;
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(updatedArtist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    // TODO: Delete associated avatar if needed

    await artist.remove();
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopArtists = async (req, res) => {
  try {
    const artists = await Artist.find()
      .sort({ followers: -1 })
      .limit(10);
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};