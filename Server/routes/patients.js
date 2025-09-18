const express = require('express');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const TreatmentPlan = require('../models/TreatmentPlan');
const { authorize, authorizeDoctorOrAdmin } = require('../middleware/auth');
const { validatePatient, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin/Doctor)
const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const users = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      }).select('_id');
      
      query.user = { $in: users.map(user => user._id) };
    }

    // Filter by dosha
    if (req.query.dosha) {
      query['prakriti.dominantDosha'] = req.query.dosha;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Sort options
    let sortField = 'createdAt';
    let sortOrder = -1;
    
    if (req.query.sortBy) {
      sortField = req.query.sortBy;
      sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    }

    const patients = await Patient.find(query)
      .populate('user', 'firstName lastName email phone avatar isActive')
      .populate('currentTreatmentPlan', 'title status schedule.startDate schedule.endDate')
      .sort({ [sortField]: sortOrder })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Patient.countDocuments(query);

    // Pagination info
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
        patients,
        pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private (Admin/Doctor/Own Patient)
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'firstName lastName email phone avatar isActive lastLogin')
      .populate('currentTreatmentPlan')
      .populate('treatmentHistory.treatmentPlan', 'title')
      .populate('appointmentPreferences.preferredDoctors', 'firstName lastName');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Check if user can access this patient's data
    if (req.user.role === 'patient' && patient.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own profile.'
      });
    }

    // Get recent appointments
    const recentAppointments = await Appointment.find({ patient: patient._id })
      .sort({ appointmentDate: -1 })
      .limit(5)
      .populate('doctor', 'firstName lastName')
      .populate('treatment', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        patient,
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create patient profile
// @route   POST /api/patients
// @access  Private (Admin/Doctor)
const createPatient = async (req, res) => {
  try {
    const { userId, ...patientData } = req.body;

    // Check if user exists and is a patient
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.role !== 'patient') {
      return res.status(400).json({
        status: 'error',
        message: 'User must have patient role'
      });
    }

    // Check if patient profile already exists
    const existingPatient = await Patient.findOne({ user: userId });
    if (existingPatient) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient profile already exists for this user'
      });
    }

    const patient = await Patient.create({
      user: userId,
      ...patientData
    });

    const populatedPatient = await Patient.findById(patient._id)
      .populate('user', 'firstName lastName email phone');

    res.status(201).json({
      status: 'success',
      message: 'Patient profile created successfully',
      data: { patient: populatedPatient }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private (Admin/Doctor/Own Patient)
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Check if user can update this patient's data
    if (req.user.role === 'patient' && patient.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own profile.'
      });
    }

    // Fields that only doctors/admins can update
    const restrictedFields = ['prakriti', 'vikriti', 'medicalHistory', 'currentTreatmentPlan'];
    
    if (req.user.role === 'patient') {
      restrictedFields.forEach(field => {
        if (req.body[field]) {
          delete req.body[field];
        }
      });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone');

    res.status(200).json({
      status: 'success',
      message: 'Patient profile updated successfully',
      data: { patient: updatedPatient }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete patient profile
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Soft delete - deactivate instead of removing
    patient.isActive = false;
    await patient.save();

    // Also deactivate the user account
    await User.findByIdAndUpdate(patient.user, { isActive: false });

    res.status(200).json({
      status: 'success',
      message: 'Patient profile deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting patient profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get patient statistics
// @route   GET /api/patients/stats
// @access  Private (Admin/Doctor)
const getPatientStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const newPatientsThisMonth = await Patient.countDocuments({
      isActive: true,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    // Age distribution
    const ageDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), "$dateOfBirth"] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 18] }, then: "0-17" },
                { case: { $lt: ["$age", 30] }, then: "18-29" },
                { case: { $lt: ["$age", 45] }, then: "30-44" },
                { case: { $lt: ["$age", 60] }, then: "45-59" },
                { case: { $gte: ["$age", 60] }, then: "60+" }
              ],
              default: "Unknown"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Gender distribution
    const genderDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);

    // Dosha distribution
    const doshaDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$prakriti.dominantDosha", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalPatients,
        newPatientsThisMonth,
        ageDistribution,
        genderDistribution,
        doshaDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', authorizeDoctorOrAdmin, validatePagination, getAllPatients);
router.get('/stats', authorizeDoctorOrAdmin, getPatientStats);
router.get('/:id', validateObjectId, getPatient);
router.post('/', authorizeDoctorOrAdmin, validatePatient, createPatient);
router.put('/:id', validateObjectId, updatePatient);
router.delete('/:id', authorize('admin'), validateObjectId, deletePatient);

module.exports = router;
