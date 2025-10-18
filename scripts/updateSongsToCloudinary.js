/**
 * Script cập nhật URL bài hát từ local sang Cloudinary
 * Chạy sau khi đã upload file lên Cloudinary
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Song from '../models/Song.js';

// Load environment variables
dotenv.config();

// Mapping filename -> Cloudinary URL (từ kết quả migration)
const cloudinaryMapping = {
  // Audio files
  'Addison Rae - High Fashion (Official Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761336/spotifa/music/tntunssar8lai3fchkre.mp3',
  'Adele - Skyfall (Official Lyric Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761338/spotifa/music/qnv4hhoig8xlqb2tmaa8.mp3',
  'Billie Eilish - BIRDS OF A FEATHER (Official Music Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761339/spotifa/music/hgwj4yvcqi1cgbxk3klp.mp3',
  'Dua Lipa - Dance The Night (From Barbie The Album).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761341/spotifa/music/x8zjaiuyazsyofquezsk.mp3',
  'Dua Lipa - Illusion (Official Music Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761343/spotifa/music/rjw2gzip3zoyduql9yvt.mp3',
  'Ed Sheeran - Azizam (Official Music Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761344/spotifa/music/m2wey5kjeltoislrax3y.mp3',
  'Espresso.mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761346/spotifa/music/vkw67tul3guc2srlkbjf.mp3',
  'Gracie Abrams - Thats So True (Official Lyric Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761347/spotifa/music/rxwqs9rme0ueqdpxxwib.mp3',
  'Lady Gaga, Bruno Mars - Die With A Smile (Official Music Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761349/spotifa/music/slkyexzzgx7dtfj2e1ns.mp3',
  'Tate McRae - greedy (Official Video).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761350/spotifa/music/eippmgs6qru7i9wunp9y.mp3',
  'The Weeknd - In Your Eyes ft. Kenny G (Official Live Performance) - Vevo.mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761352/spotifa/music/kavpaezow9uaqq0xjuxy.mp3',
  'The Weeknd - Take Me Back To LA (Audio).mp3': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761353/spotifa/music/u18xda482cveaiot4ufz.mp3',
  
  // Video files
  'Adele - Someone Like You (Official Music Video).mp4': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761363/spotifa/video/vgljjzo9kyzaat4vvulo.mp4',
  'Dua Lipa - New Rules (Official Music Video).mp4': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761379/spotifa/video/ibs3y2knwudppjkxqwjl.mp4',
  'Tate McRae - greedy (Official Video).mp4': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761413/spotifa/video/i0vrv4bfz2yrmwhz9oqd.mp4',
  'Taylor Swift - Shake It Off.mp4': 'https://res.cloudinary.com/dtqudkmib/video/upload/v1760761423/spotifa/video/rfxeecmsikvazz2pjfxi.mp4',
};

// Extract public_id from URL
function getPublicIdFromUrl(url) {
  // URL format: https://res.cloudinary.com/dtqudkmib/video/upload/v1760761336/spotifa/music/tntunssar8lai3fchkre.mp3
  const match = url.match(/upload\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : null;
}

async function updateSongs() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 CẬP NHẬT URL BÀI HÁT SANG CLOUDINARY');
  console.log('='.repeat(60) + '\n');

  try {
    // Connect to database
    await connectDB();

    // Lấy tất cả bài hát
    const allSongs = await Song.find({});
    console.log(`📊 Tìm thấy ${allSongs.length} bài hát trong database\n`);

    let updated = 0;
    let notFound = 0;

    for (const song of allSongs) {
      // Lấy filename từ path hiện tại
      // VD: /assets/music/Espresso.mp3 -> Espresso.mp3
      const filename = song.src.split('/').pop();
      
      // Tìm URL Cloudinary tương ứng
      const cloudinaryUrl = cloudinaryMapping[filename];

      if (cloudinaryUrl) {
        const publicId = getPublicIdFromUrl(cloudinaryUrl);
        const mediaType = filename.endsWith('.mp4') ? 'video' : 'audio';

        await Song.findByIdAndUpdate(song._id, {
          src: cloudinaryUrl,
          cloudinary_public_id: publicId,
          mediaType: mediaType
        });

        console.log(`✅ Cập nhật: ${song.title}`);
        console.log(`   📁 Local: ${song.src}`);
        console.log(`   ☁️  Cloud: ${cloudinaryUrl}\n`);
        updated++;
      } else {
        console.log(`⚠️  Không tìm thấy: ${filename}`);
        console.log(`   Bài hát: ${song.title}\n`);
        notFound++;
      }
    }

    console.log('='.repeat(60));
    console.log(`✅ Hoàn thành!`);
    console.log(`   - Đã cập nhật: ${updated} bài hát`);
    console.log(`   - Không tìm thấy: ${notFound} bài hát`);
    console.log('='.repeat(60) + '\n');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database.\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

// Run
updateSongs();
