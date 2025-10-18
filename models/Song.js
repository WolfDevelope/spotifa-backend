
import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  cover: { type: String },
  src: { type: String },
  cloudinary_public_id: { type: String }, // For Cloudinary file management
  duration: { type: String, required: true },
  durationSec: { type: Number, required: true },
  mediaType: { type: String, default: 'audio' },
  lyrics: { type: String },
  releaseDate: { type: Date, default: Date.now },
  genre: { type: String },
  plays: { type: Number, default: 0 }
});

const Song = mongoose.model('Song', songSchema);

export default Song;