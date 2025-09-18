const express = require('express');
const Treatment = require('../models/Treatment');
const { authorize, authorizeDoctorOrAdmin } = require('../middleware/auth');
const { validateTreatment, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all treatments
// @route   GET /api/treatments
// @access  Private
const getAllTreatments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by subcategory
    if (req.query.subCategory) {
      query.subCategory = req.query.subCategory;
    }

    // Filter by target dosha
    if (req.query.dosha) {
      query.targetDosha = req.query.dosha;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query['pricing.perSession'] = {};
      if (req.query.minPrice) {
        query['pricing.perSession'].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query['pricing.perSession'].$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Sort options
    let sortField = 'createdAt';
    let sortOrder = -1;
    
    if (req.query.sortBy) {
      sortField = req.query.sortBy;
      sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    }

    // Text search scoring
    if (req.query.search) {
      sortField = { score: { $meta: 'textScore' } };
    }

    const treatments = await Treatment.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort(sortField)
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Treatment.countDocuments(query);

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
        treatments,
        pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching treatments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single treatment
// @route   GET /api/treatments/:id
// @access  Private
const getTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!treatment) {
      return res.status(404).json({
        status: 'error',
        message: 'Treatment not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { treatment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching treatment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new treatment
// @route   POST /api/treatments
// @access  Private (Admin/Doctor)
const createTreatment = async (req, res) => {
  try {
    const treatmentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const treatment = await Treatment.create(treatmentData);

    const populatedTreatment = await Treatment.findById(treatment._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      status: 'success',
      message: 'Treatment created successfully',
      data: { treatment: populatedTreatment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating treatment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update treatment
// @route   PUT /api/treatments/:id
// @access  Private (Admin/Doctor)
const updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        status: 'error',
        message: 'Treatment not found'
      });
    }

    const updatedTreatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      message: 'Treatment updated successfully',
      data: { treatment: updatedTreatment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating treatment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete treatment (soft delete)
// @route   DELETE /api/treatments/:id
// @access  Private (Admin only)
const deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        status: 'error',
        message: 'Treatment not found'
      });
    }

    // Soft delete by setting isActive to false
    treatment.isActive = false;
    treatment.updatedBy = req.user.id;
    await treatment.save();

    res.status(200).json({
      status: 'success',
      message: 'Treatment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting treatment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get treatment categories
// @route   GET /api/treatments/categories
// @access  Private
const getTreatmentCategories = async (req, res) => {
  try {
    const categories = await Treatment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          treatments: {
            $push: {
              id: '$_id',
              name: '$name',
              pricing: '$pricing'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const subCategories = await Treatment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            category: '$category',
            subCategory: '$subCategory'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          subCategories: {
            $push: {
              name: '$_id.subCategory',
              count: '$count'
            }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        categories,
        subCategories
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching treatment categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get popular treatments
// @route   GET /api/treatments/popular
// @access  Private
const getPopularTreatments = async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    
    const popularTreatments = await Appointment.aggregate([
      {
        $group: {
          _id: '$treatment',
          appointmentCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'treatments',
          localField: '_id',
          foreignField: '_id',
          as: 'treatment'
        }
      },
      { $unwind: '$treatment' },
      {
        $project: {
          treatment: '$treatment',
          appointmentCount: 1,
          completedCount: 1,
          successRate: {
            $cond: [
              { $eq: ['$appointmentCount', 0] },
              0,
              { $multiply: [{ $divide: ['$completedCount', '$appointmentCount'] }, 100] }
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: { popularTreatments }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching popular treatments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get treatment statistics
// @route   GET /api/treatments/stats
// @access  Private (Admin/Doctor)
const getTreatmentStats = async (req, res) => {
  try {
    const totalTreatments = await Treatment.countDocuments({ isActive: true });
    
    const categoryStats = await Treatment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$pricing.perSession' },
          minPrice: { $min: '$pricing.perSession' },
          maxPrice: { $max: '$pricing.perSession' }
        }
      }
    ]);

    const doshaStats = await Treatment.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$targetDosha' },
      {
        $group: {
          _id: '$targetDosha',
          count: { $sum: 1 }
        }
      }
    ]);

    const priceRanges = await Treatment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$pricing.perSession', 1000] }, then: '0-999' },
                { case: { $lt: ['$pricing.perSession', 2000] }, then: '1000-1999' },
                { case: { $lt: ['$pricing.perSession', 5000] }, then: '2000-4999' },
                { case: { $gte: ['$pricing.perSession', 5000] }, then: '5000+' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalTreatments,
        categoryStats,
        doshaStats,
        priceRanges
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching treatment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', validatePagination, getAllTreatments);
router.get('/categories', getTreatmentCategories);
router.get('/popular', getPopularTreatments);
router.get('/stats', authorizeDoctorOrAdmin, getTreatmentStats);
router.get('/:id', validateObjectId, getTreatment);
router.post('/', authorizeDoctorOrAdmin, validateTreatment, createTreatment);
router.put('/:id', authorizeDoctorOrAdmin, validateObjectId, updateTreatment);
router.delete('/:id', authorize('admin'), validateObjectId, deleteTreatment);

module.exports = router;
