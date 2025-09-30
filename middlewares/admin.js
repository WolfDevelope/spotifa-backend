import User from '../models/User.js';

// Middleware kiểm tra quyền admin
export const requireAdmin = async (req, res, next) => {
  try {
    // Kiểm tra xem user đã được xác thực chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    // Lấy thông tin user từ database để đảm bảo role mới nhất
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Kiểm tra role admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Gán user vào request để sử dụng trong controller
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking admin privileges.'
    });
  }
};

// Middleware kiểm tra quyền admin hoặc artist (cho một số tính năng)
export const requireAdminOrArtist = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.role !== 'admin' && user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Artist privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin/Artist middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking privileges.'
    });
  }
};
