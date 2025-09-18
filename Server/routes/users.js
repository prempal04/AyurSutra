const express = require('express');
const User = require('../models/User');
const { authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin or own profile)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Fields that only admins can update
    const adminOnlyFields = ['role', 'isActive', 'isVerified'];
    
    if (req.user.role !== 'admin') {
      adminOnlyFields.forEach(field => {
        if (req.body[field] !== undefined) {
          delete req.body[field];
        }
      });
    }

    // Don't allow password updates through this route
    delete req.body.password;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Soft delete by deactivating the user
    user.isActive = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get doctors list
// @route   GET /api/users/doctors
// @access  Private
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      isActive: true
    })
      .select('firstName lastName email phone avatar')
      .sort({ firstName: 1 });

    res.status(200).json({
      status: 'success',
      data: { doctors }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    
    const roleDistribution = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const newUsersThisMonth = await User.countDocuments({
      isActive: true,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const verificationStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          unverified: { $sum: { $cond: ['$isVerified', 0, 1] } }
        }
      }
    ]);

    const loginStats = await User.aggregate([
      { $match: { isActive: true, lastLogin: { $exists: true } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$lastLogin'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        roleDistribution,
        newUsersThisMonth,
        verificationStats: verificationStats[0] || { total: 0, verified: 0, unverified: 0 },
        loginStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', authorize('admin'), validatePagination, getAllUsers);
router.get('/doctors', getDoctors);
router.get('/stats', authorize('admin'), getUserStats);
router.get('/:id', authorizeOwnerOrAdmin, validateObjectId, getUser);
router.put('/:id', authorizeOwnerOrAdmin, validateObjectId, updateUser);
router.delete('/:id', authorize('admin'), validateObjectId, deleteUser);

module.exports = router;
