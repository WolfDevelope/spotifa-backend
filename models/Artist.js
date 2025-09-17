import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  avatar: { type: String, required: true },
  bio: { type: String },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  followers: { type: Number, default: 0 }
});

const Artist = mongoose.model('Artist', artistSchema);

export default Artist;