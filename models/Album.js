import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  cover: { type: String, required: true },
  year: { type: Number, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  genre: { type: String }
});

const Album = mongoose.model('Album', albumSchema);

export default Album;