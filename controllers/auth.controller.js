import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/email.js";

// Helper: sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// Helper: create and send token with response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Remove password
  const userObj = user.toObject ? user.toObject() : user;
  userObj.password = undefined;

  res.cookie("jwt", token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
export const register = async (req, res) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      role: req.body.role || "user",
      name: req.body.name || '',
      phone: req.body.phone || '',
      about: req.body.about || '',
      genre: req.body.genre || ''
    });

    const verificationToken = newUser.generateEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    if (process.env.NODE_ENV === "development") {
      newUser.isEmailVerified = true;
      newUser.emailVerificationToken = undefined;
      newUser.emailVerificationExpire = undefined;
      await newUser.save({ validateBeforeSave: false });

      return createSendToken(newUser, 201, res);
    } else {
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/verify-email/${verificationToken}`;

      await sendEmail({
        email: newUser.email,
        subject: "Verify your email address",
        template: "verifyEmail",
        context: { name: newUser.username, verificationUrl },
      });

      return res.status(201).json({
        success: true,
        message:
          "Verification email sent! Please check your email to verify your account.",
      });
    }
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Verify email
// @route GET /api/auth/verify-email/:token
// @access Public
export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token is invalid or has expired" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res);
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in",
      });
    }

    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${remainingTime} minutes.`,
      });
    }

    await user.resetLoginAttempts();
    createSendToken(user, 200, res);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Logout user
// @route POST /api/auth/logout
// @access Private
export const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc Forgot password
// @route POST /api/auth/forgot-password
// @access Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with that email" });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      template: "passwordReset",
      context: { name: user.username, url: resetURL },
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent!",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error sending reset email" });
  }
};

// @desc Reset password
// @route PATCH /api/auth/reset-password/:token
// @access Public
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token is invalid or has expired" });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Update password
// @route PATCH /api/auth/update-password
// @access Private
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1) Check if posted current password is correct
    if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Your current password is incorrect',
      });
    }

    // 2) If so, update password
    user.password = req.body.newPassword;
    user.passwordChangedAt = Date.now(); // Cập nhật thởi điểm đổi mật khẩu
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Update user profile
// @route PATCH /api/auth/update-me
// @access Private
export const updateMe = async (req, res) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: "This route is not for password updates. Please use /update-password.",
      });
    }

    // Only allow update of certain fields
    const allowedFields = ["name", "email", "phone", "about", "genre"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        !(typeof req.body[field] === 'string' && req.body[field].trim() === '')
      ) {
        updates[field] = req.body[field];
      }
    });

    // KHÔNG cập nhật passwordChangedAt ở đây!
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

// @desc Delete user account
// @route DELETE /api/auth/delete-me
// @access Private
export const deleteMe = async (req, res) => {
  try {
    // Thực sự xóa user khỏi database thay vì chỉ set isActive: false
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
// @access Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
};

// @desc Resend verification email
// @route POST /api/auth/resend-verification
// @access Public
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with that email" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified" });
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Verify your email address",
      template: "verifyEmail",
      context: { name: user.username, verificationUrl },
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent!",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};
