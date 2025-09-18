const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'User with this phone number already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'patient'
    });

    // If user is a patient, create patient profile
    if (user.role === 'patient') {
      await Patient.create({
        user: user._id,
        dateOfBirth: dateOfBirth || new Date(),
        gender: gender || 'other'
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('Account inactive:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match for', email, ':', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let additionalData = {};
    
    // If user is a patient, get patient profile
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id })
        .populate('currentTreatmentPlan');
      additionalData.patientProfile = patient;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
        ...additionalData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'preferences'];
    const updates = {};

    // Filter allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error logging out',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
