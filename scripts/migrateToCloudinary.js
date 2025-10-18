import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import Song from '../models/Song.js';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

class MigrationScript {
  constructor() {
    // Đường dẫn đến thư mục Frontend (nơi chứa file thật)
    this.musicDir = path.join(__dirname, '../../Spotifa/public/assets/music');
    this.videoDir = path.join(__dirname, '../../Spotifa/public/assets/video');
    this.stats = {
      totalFiles: 0,
      uploadedFiles: 0,
      failedFiles: 0,
      updatedSongs: 0,
      failedUpdates: 0
    };
  }

  // Get all files from directory recursively
  async getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);

      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = await this.getAllFiles(filePath, arrayOfFiles);
      } else {
        // Only process audio and video files
        const ext = path.extname(file).toLowerCase();
        if (['.mp3', '.wav', '.ogg', '.mp4', '.mov', '.avi', '.m4a'].includes(ext)) {
          arrayOfFiles.push({
            fullPath: filePath,
            relativePath: path.relative(path.join(__dirname, '../public'), filePath),
            filename: file,
            extension: ext,
            type: this.getFileType(ext)
          });
        }
      }
    }

    return arrayOfFiles;
  }

  getFileType(extension) {
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a'];
    const videoExts = ['.mp4', '.mov', '.avi'];

    if (audioExts.includes(extension)) return 'audio';
    if (videoExts.includes(extension)) return 'video';
    return 'unknown';
  }

  // Upload file to Cloudinary
  async uploadFile(fileInfo) {
    try {
      console.log(`📤 Uploading: ${fileInfo.relativePath}`);

      const uploadResult = await uploadToCloudinary(
        fileInfo.fullPath,
        `spotifa/${fileInfo.type === 'audio' ? 'music' : 'video'}`
      );

      if (uploadResult.success) {
        console.log(`✅ Uploaded: ${fileInfo.filename} -> ${uploadResult.url}`);
        return uploadResult;
      } else {
        console.error(`❌ Failed to upload: ${fileInfo.filename} - ${uploadResult.error}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error uploading ${fileInfo.filename}:`, error.message);
      return null;
    }
  }

  // Update song in database
  async updateSongInDatabase(localPath, cloudinaryUrl, publicId, fileType) {
    try {
      // Find song by local path
      let updateData = {};

      if (fileType === 'audio') {
        updateData = {
          src: cloudinaryUrl,
          cloudinary_public_id: publicId,
          mediaType: 'audio'
        };
      } else if (fileType === 'video') {
        updateData = {
          src: cloudinaryUrl,
          cloudinary_public_id: publicId,
          mediaType: 'video'
        };
      }

      const updatedSong = await Song.findOneAndUpdate(
        { src: localPath },
        updateData,
        { new: true }
      );

      if (updatedSong) {
        console.log(`📝 Updated song: ${updatedSong.title}`);
        return true;
      } else {
        console.log(`⚠️  No song found with path: ${localPath}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error updating song ${localPath}:`, error.message);
      return false;
    }
  }

  // Main migration function
  async runMigration() {
    console.log('🚀 Starting migration from local files to Cloudinary...\n');

    // Check if directories exist
    if (!fs.existsSync(this.musicDir)) {
      console.log(`⚠️  Music directory not found: ${this.musicDir}`);
      console.log('   Skipping music files...\n');
    }

    if (!fs.existsSync(this.videoDir)) {
      console.log(`⚠️  Video directory not found: ${this.videoDir}`);
      console.log('   Skipping video files...\n');
    }

    // Get all files from both directories
    let musicFiles = [];
    let videoFiles = [];

    if (fs.existsSync(this.musicDir)) {
      musicFiles = await this.getAllFiles(this.musicDir);
    }

    if (fs.existsSync(this.videoDir)) {
      videoFiles = await this.getAllFiles(this.videoDir);
    }

    const allFiles = [...musicFiles, ...videoFiles];
    this.stats.totalFiles = allFiles.length;

    if (allFiles.length === 0) {
      console.log('📭 No files found to migrate.');
      console.log('   Make sure you have files in:');
      console.log(`   - ${this.musicDir}`);
      console.log(`   - ${this.videoDir}`);
      return;
    }

    console.log(`📊 Found ${allFiles.length} files to migrate`);
    console.log(`   - Music files: ${musicFiles.length}`);
    console.log(`   - Video files: ${videoFiles.length}\n`);

    // Upload each file
    for (const fileInfo of allFiles) {
      const uploadResult = await this.uploadFile(fileInfo);

      if (uploadResult) {
        this.stats.uploadedFiles++;

        // Update database
        // Tạo path đúng format: /assets/music/filename.mp3 hoặc /assets/video/filename.mp4
        const filename = fileInfo.filename;
        const localPath = `/assets/${fileInfo.type === 'audio' ? 'music' : 'video'}/${filename}`;
        
        console.log(`🔍 Tìm bài hát với path: ${localPath}`);
        
        const updated = await this.updateSongInDatabase(
          localPath,
          uploadResult.url,
          uploadResult.public_id,
          fileInfo.type
        );

        if (updated) {
          this.stats.updatedSongs++;
        } else {
          this.stats.failedUpdates++;
        }
      } else {
        this.stats.failedFiles++;
      }

      // Progress indicator
      const progress = ((this.stats.uploadedFiles + this.stats.failedFiles) / this.stats.totalFiles * 100).toFixed(1);
      console.log(`📈 Progress: ${progress}% (${this.stats.uploadedFiles + this.stats.failedFiles}/${this.stats.totalFiles})\n`);
    }

    // Print final statistics
    console.log('📊 Migration completed!');
    console.log(`   - Total files: ${this.stats.totalFiles}`);
    console.log(`   - Successfully uploaded: ${this.stats.uploadedFiles}`);
    console.log(`   - Failed uploads: ${this.stats.failedFiles}`);
    console.log(`   - Songs updated: ${this.stats.updatedSongs}`);
    console.log(`   - Failed updates: ${this.stats.failedUpdates}`);

    if (this.stats.failedFiles > 0 || this.stats.failedUpdates > 0) {
      console.log('\n⚠️  Some files failed to migrate. Please check the logs above.');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the migration if this script is executed directly
// Check if this file is being run directly (not imported)
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  const migration = new MigrationScript();
  migration.runMigration().catch(console.error);
}

export default MigrationScript;
