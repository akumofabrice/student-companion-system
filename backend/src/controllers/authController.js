const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isDbConnected } = require('../config/db');

exports.register = async (req, res) => {
  const { username, email, password, phone, address } = req.body;
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is currently unavailable. Please try again later.' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || ''
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'student_companion_secret', { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        photo: user.photo
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is currently unavailable. Please try again later.' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'student_companion_secret', { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        photo: user.photo
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { username, email } = req.body;
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is currently unavailable. Please try again later.' });
    }
    const user = await User.findOne({
      $or: [{ username }, { email: email || username }]
    });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for that username or email, a recovery code has been generated.'
      });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.status(200).json({
      message: 'Recovery code generated. Use it to reset your password.',
      resetCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Password recovery failed', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { username, email, resetCode, newPassword } = req.body;
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database is currently unavailable. Please try again later.' });
    }
    const user = await User.findOne({
      $or: [{ username }, { email: email || username }]
    });

    if (!user || !user.passwordResetCode || !user.passwordResetExpires) {
      return res.status(400).json({ message: 'Invalid or expired recovery code' });
    }

    if (user.passwordResetCode !== resetCode || new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired recovery code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetCode = '';
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Profile retrieval failed', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { phone, address, photo, username, email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username !== undefined && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (email !== undefined && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email;
    }

    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (photo !== undefined) user.photo = photo;

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        photo: user.photo
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
};
