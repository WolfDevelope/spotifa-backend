import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Album from '../models/Album.js';

// Import data từ frontend
import data from '../../Spotifa/src/data.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateData = async () => {
  try {
    console.log('🚀 Starting data migration...');

    // Clear existing data
    await Song.deleteMany({});
    await Artist.deleteMany({});
    await Album.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create artists first
    console.log('📝 Migrating artists...');
    const artistMap = new Map();
    
    for (const artist of data.artists) {
      try {
        const newArtist = new Artist({
          name: artist.name,
          avatar: artist.avatar,
          bio: artist.bio || '',
          followers: Math.floor(Math.random() * 1000000) // Random followers
        });
        
        const savedArtist = await newArtist.save();
        artistMap.set(artist.id, savedArtist._id);
      } catch (error) {
        console.log(`⚠️ Skipped artist ${artist.name}: ${error.message}`);
      }
    }
    console.log(`✅ Migrated ${artistMap.size} artists`);

    // Create albums
    console.log('📝 Migrating albums...');
    const albumMap = new Map();
    
    for (const album of data.albums) {
      if (album.artistId && artistMap.has(album.artistId)) {
        try {
          const newAlbum = new Album({
            name: album.name,
            artist: artistMap.get(album.artistId),
            cover: album.cover,
            year: parseInt(album.year) || new Date().getFullYear(),
            genre: album.genre || 'Pop'
          });
          
          const savedAlbum = await newAlbum.save();
          albumMap.set(album.id, savedAlbum._id);
        } catch (error) {
          console.log(`⚠️ Skipped album ${album.name}: ${error.message}`);
        }
      }
    }
    console.log(`✅ Migrated ${albumMap.size} albums`);

    // Create songs
    console.log('📝 Migrating songs...');
    let songCount = 0;
    for (const song of data.songs) {
      if (artistMap.has(song.artistId)) {
        try {
          const newSong = new Song({
            title: song.title,
            artist: artistMap.get(song.artistId),
            album: song.albumId && albumMap.has(song.albumId) ? albumMap.get(song.albumId) : null,
            cover: song.cover,
            src: song.src || '/assets/music/default.mp3',
            duration: song.duration,
            durationSec: song.durationSec,
            mediaType: song.mediaType || 'audio',
            lyrics: song.lyrics,
            releaseDate: song.releaseDate ? new Date(song.releaseDate) : new Date(),
            genre: song.genre || 'Pop',
            plays: Math.floor(Math.random() * 1000000) // Random play count
          });
          
          await newSong.save();
          songCount++;
        } catch (error) {
          console.log(`⚠️ Skipped song ${song.title}: ${error.message}`);
        }
      }
    }
    console.log(`✅ Migrated ${songCount} songs`);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Artists: ${await Artist.countDocuments()}`);
    console.log(`   - Albums: ${await Album.countDocuments()}`);
    console.log(`   - Songs: ${await Song.countDocuments()}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
};

const runMigration = async () => {
  await connectDB();
  await migrateData();
};

// Run migration
runMigration();
