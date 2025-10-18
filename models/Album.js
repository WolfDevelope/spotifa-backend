import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  cover: { type: String, default: '/assets/images/album-icon.png' },
  cloudinary_public_id: { type: String }, // For Cloudinary cover image management
  year: { type: Number, default: () => new Date().getFullYear() },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  genre: { type: String, default: 'Unknown' },
  description: { type: String }
}, {
  timestamps: true
});

const Album = mongoose.model('Album', albumSchema);

export default Album;