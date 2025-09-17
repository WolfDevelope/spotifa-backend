import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Function to get token from header
const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
};

// Function to verify JWT token
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          reject(new AppError('Your token has expired! Please log in again.', 401));
        } else if (err.name === 'JsonWebTokenError') {
          reject(new AppError('Invalid token. Please log in again!', 401));
        } else {
          reject(new AppError('Authentication failed!', 401));
        }
      } else {
        resolve(decoded);
      }
    });
  });
};

// Protect routes - requires user to be logged in
export const protect = async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    const token = getTokenFromHeader(req);

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verify token
    const decoded = await verifyToken(token);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    // 5) Check if email is verified
    if (!currentUser.isEmailVerified) {
      return next(
        new AppError('Please verify your email address to continue.', 403)
      );
    }

    // 6) Check if account is locked
    if (currentUser.isLocked) {
      const remainingTime = Math.ceil((currentUser.lockUntil - Date.now()) / 60000);
      return next(
        new AppError(
          `Account is temporarily locked. Try again in ${remainingTime} minutes.`,
          429
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Restrict to certain roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Check if user is logged in, only for rendered pages, no errors
export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await verifyToken(req.cookies.jwt);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Check if user is authenticated for API requests
export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please log in to access this resource.', 401));
  }
  next();
};

// Check if user is an admin
export const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(
      new AppError('This route is restricted to administrators only', 403)
    );
  }
  next();
};

// Alias for admin middleware for backward compatibility
export const isAdmin = admin;

// Check if user is an artist or admin
export const isArtistOrAdmin = (req, res, next) => {
  if (!['artist', 'admin'].includes(req.user.role)) {
    return next(
      new AppError('This route is restricted to artists and administrators only', 403)
    );
  }
  next();
};

// Rate limiting middleware
export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Clean up old entries
    for (const [ip, entry] of requests.entries()) {
      if (entry.timestamp < windowStart) {
        requests.delete(ip);
      }
    }

    // Get or create entry for this IP
    const entry = requests.get(clientIP) || { count: 0, timestamp: now };
    
    // Check if request is within rate limit
    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.timestamp + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return next(
        new AppError('Too many requests, please try again later.', 429)
      );
    }

    // Update request count
    entry.count++;
    requests.set(clientIP, entry);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': max - entry.count,
      'X-RateLimit-Reset': Math.ceil((entry.timestamp + windowMs) / 1000)
    });

    next();
  };
};