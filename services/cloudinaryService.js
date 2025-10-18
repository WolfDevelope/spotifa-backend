import { cloudinary } from '../config/cloudinary.js';

// Upload single file
export const uploadToCloudinary = async (filePath, folder = 'spotifa') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      // For audio files, we can add transformations
      ...(filePath.match(/\.(mp3|wav|ogg)$/i) && {
        resource_type: 'video', // Cloudinary treats audio as video
      }),
    });
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

// Get optimized URL for streaming
export const getOptimizedAudioUrl = (publicId, quality = 'auto') => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'mp3',
    quality,
    secure: true,
  });
};
