/**
 * Script test upload file lên Cloudinary
 * Chạy: node scripts/testCloudinaryUpload.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Màu sắc cho console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}▶️  ${msg}${colors.reset}`)
};

class CloudinaryTester {
  constructor() {
    this.uploadedFiles = [];
  }

  // Kiểm tra cấu hình Cloudinary
  checkConfig() {
    log.step('Kiểm tra cấu hình Cloudinary...');
    
    const requiredEnvVars = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    let allConfigured = true;

    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        log.success(`${varName}: ${this.maskSecret(process.env[varName])}`);
      } else {
        log.error(`${varName}: Chưa được cấu hình!`);
        allConfigured = false;
      }
    });

    if (!allConfigured) {
      log.error('Vui lòng cấu hình đầy đủ Cloudinary credentials trong file .env');
      process.exit(1);
    }

    log.success('Cấu hình Cloudinary hoàn tất!\n');
  }

  // Che giấu một phần secret
  maskSecret(secret) {
    if (!secret || secret.length < 8) return '***';
    return secret.substring(0, 4) + '***' + secret.substring(secret.length - 4);
  }

  // Tạo file test
  async createTestFile() {
    log.step('Tạo file test...');
    
    const testDir = path.join(__dirname, '../test-uploads');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testFilePath = path.join(testDir, 'test-audio.txt');
    const testContent = `
      This is a test file for Cloudinary upload
      Created at: ${new Date().toISOString()}
      Project: Spotifa
    `;

    fs.writeFileSync(testFilePath, testContent);
    log.success(`File test đã được tạo: ${testFilePath}\n`);
    
    return testFilePath;
  }

  // Test upload file
  async testUpload(filePath) {
    log.step('Đang upload file lên Cloudinary...');
    
    try {
      const startTime = Date.now();
      const result = await uploadToCloudinary(filePath, 'spotifa/test');
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (result.success) {
        log.success(`Upload thành công trong ${duration}s`);
        log.info(`URL: ${result.url}`);
        log.info(`Public ID: ${result.public_id}\n`);
        
        this.uploadedFiles.push(result.public_id);
        return result;
      } else {
        log.error(`Upload thất bại: ${result.error}\n`);
        return null;
      }
    } catch (error) {
      log.error(`Lỗi upload: ${error.message}\n`);
      return null;
    }
  }

  // Test xóa file
  async testDelete(publicId) {
    log.step(`Đang xóa file từ Cloudinary: ${publicId}...`);
    
    try {
      const result = await deleteFromCloudinary(publicId);
      
      if (result.success) {
        log.success('Xóa file thành công!\n');
        return true;
      } else {
        log.error(`Xóa file thất bại: ${result.error}\n`);
        return false;
      }
    } catch (error) {
      log.error(`Lỗi xóa file: ${error.message}\n`);
      return false;
    }
  }

  // Dọn dẹp file test
  cleanup(filePath) {
    log.step('Dọn dẹp file test...');
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log.success('Đã xóa file test local\n');
      }
    } catch (error) {
      log.warning(`Không thể xóa file test: ${error.message}\n`);
    }
  }

  // Chạy tất cả test
  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 CLOUDINARY UPLOAD TEST - SPOTIFA');
    console.log('='.repeat(60) + '\n');

    // 1. Kiểm tra cấu hình
    this.checkConfig();

    // 2. Tạo file test
    const testFilePath = await this.createTestFile();

    // 3. Test upload
    const uploadResult = await this.testUpload(testFilePath);

    if (!uploadResult) {
      log.error('Test thất bại! Vui lòng kiểm tra lại cấu hình.');
      this.cleanup(testFilePath);
      process.exit(1);
    }

    // 4. Test xóa
    await this.testDelete(uploadResult.public_id);

    // 5. Dọn dẹp
    this.cleanup(testFilePath);

    // Kết quả
    console.log('='.repeat(60));
    log.success('TẤT CẢ TEST ĐÃ HOÀN THÀNH!');
    console.log('='.repeat(60) + '\n');

    log.info('Bạn có thể bắt đầu sử dụng Cloudinary trong dự án!');
    log.info('Các bước tiếp theo:');
    console.log('  1. Upload file audio/video thật qua admin panel');
    console.log('  2. Hoặc chạy migration: npm run migrate-cloudinary');
    console.log('  3. Kiểm tra file trên Cloudinary Dashboard\n');
  }
}

// Chạy test
const tester = new CloudinaryTester();
tester.runAllTests().catch(error => {
  log.error(`Lỗi không mong muốn: ${error.message}`);
  process.exit(1);
});
