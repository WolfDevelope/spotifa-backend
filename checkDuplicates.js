import mongoose from 'mongoose';
import Song from './models/Song.js';

const checkDuplicates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/spotifa');
    console.log('Connected to MongoDB');

    // Get all songs
    const allSongs = await Song.find()
      .populate('artist', 'name')
      .sort({ createdAt: -1, _id: -1 });

    console.log(`\n📊 Total songs in database: ${allSongs.length}`);

    // Check for duplicates by title
    const titleMap = new Map();
    const duplicates = [];

    allSongs.forEach((song, index) => {
      const key = song.title.toLowerCase().trim();
      if (titleMap.has(key)) {
        duplicates.push({
          title: song.title,
          id1: titleMap.get(key).id,
          id2: song._id.toString(),
          artist1: titleMap.get(key).artist,
          artist2: song.artist?.name || 'Unknown'
        });
      } else {
        titleMap.set(key, {
          id: song._id.toString(),
          artist: song.artist?.name || 'Unknown'
        });
      }
    });

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate titles:`);
      duplicates.forEach(dup => {
        console.log(`- "${dup.title}"`);
        console.log(`  ID1: ${dup.id1} (${dup.artist1})`);
        console.log(`  ID2: ${dup.id2} (${dup.artist2})`);
      });
    } else {
      console.log('\n✅ No duplicate titles found');
    }

    // Show pagination simulation
    console.log('\n📄 Pagination simulation:');
    const limit = 10;
    const totalPages = Math.ceil(allSongs.length / limit);

    for (let page = 1; page <= totalPages; page++) {
      const skip = (page - 1) * limit;
      const pageSongs = allSongs.slice(skip, skip + limit);
      
      console.log(`\nPage ${page}:`);
      pageSongs.forEach((song, index) => {
        console.log(`  ${skip + index + 1}. ${song.title} (${song._id.toString().slice(-6)})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkDuplicates();
