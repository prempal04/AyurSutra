const express = require('express');
const TreatmentPlan = require('../models/TreatmentPlan');
const Patient = require('../models/Patient');
const { authorize, authorizeDoctorOrAdmin } = require('../middleware/auth');
const { validateTreatmentPlan, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all treatment plans
// @route   GET /api/treatment-plans
// @access  Private
const getAllTreatmentPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      // Patients can only see their own treatment plans
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient profile not found'
        });
      }
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      // Doctors can see treatment plans they created
      query.doctor = req.user.id;
    }
    // Admins can see all treatment plans

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by patient
    if (req.query.patient && req.user.role !== 'patient') {
      query.patient = req.query.patient;
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { planId: searchRegex }
      ];
    }

    const treatmentPlans = await TreatmentPlan.find(query)
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate('doctor', 'firstName lastName email')
      .populate('phases.treatments.treatment', 'name category')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await TreatmentPlan.countDocuments(query);

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
        treatmentPlans,
        pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching treatment plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single treatment plan
// @route   GET /api/treatment-plans/:id
// @access  Private
const getTreatmentPlan = async (req, res) => {
  try {
    const treatmentPlan = await TreatmentPlan.findById(req.params.id)
      .populate('patient', 'patientId user prakriti vikriti medicalHistory')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone avatar'
        }
      })
      .populate('doctor', 'firstName lastName email phone')
      .populate('phases.treatments.treatment', 'name category description duration pricing')
      .populate('progress.assessments.assessedBy', 'firstName lastName')
      .populate('followUp.completed.doctor', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!treatmentPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Treatment plan not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (treatmentPlan.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'doctor') {
      if (treatmentPlan.doctor._id.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { treatmentPlan }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching treatment plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new treatment plan
// @route   POST /api/treatment-plans
// @access  Private (Doctor/Admin)
const createTreatmentPlan = async (req, res) => {
  try {
    const { patient, ...treatmentPlanData } = req.body;

    // Verify patient exists
    const patientDoc = await Patient.findById(patient);
    if (!patientDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    const treatmentPlan = await TreatmentPlan.create({
      patient,
      doctor: req.user.id,
      ...treatmentPlanData,
      createdBy: req.user.id
    });

    // Update patient's current treatment plan
    await Patient.findByIdAndUpdate(patient, {
      currentTreatmentPlan: treatmentPlan._id
    });

    const populatedTreatmentPlan = await TreatmentPlan.findById(treatmentPlan._id)
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate('doctor', 'firstName lastName email');

    res.status(201).json({
      status: 'success',
      message: 'Treatment plan created successfully',
      data: { treatmentPlan: populatedTreatmentPlan }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating treatment plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update treatment plan
// @route   PUT /api/treatment-plans/:id
// @access  Private (Doctor/Admin)
const updateTreatmentPlan = async (req, res) => {
  try {
    const treatmentPlan = await TreatmentPlan.findById(req.params.id);

    if (!treatmentPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Treatment plan not found'
      });
    }

    // Check permissions
    if (req.user.role === 'doctor' && treatmentPlan.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Track modifications
    if (req.body.modifications || Object.keys(req.body).length > 0) {
      const modification = {
        date: new Date(),
        modifiedBy: req.user.id,
        reason: req.body.modificationReason || 'Plan updated',
        changes: Object.keys(req.body).filter(key => key !== 'modificationReason').join(', ')
      };

      if (!treatmentPlan.modifications) {
        treatmentPlan.modifications = [];
      }
      treatmentPlan.modifications.push(modification);
    }

    const updatedTreatmentPlan = await TreatmentPlan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    )
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate('doctor', 'firstName lastName email');

    res.status(200).json({
      status: 'success',
      message: 'Treatment plan updated successfully',
      data: { treatmentPlan: updatedTreatmentPlan }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating treatment plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update treatment plan progress
// @route   PATCH /api/treatment-plans/:id/progress
// @access  Private (Doctor/Admin)
const updateProgress = async (req, res) => {
  try {
    const { sessionCompleted, phaseCompleted, assessment } = req.body;
    const treatmentPlan = await TreatmentPlan.findById(req.params.id);

    if (!treatmentPlan) {
      return res.status(404).json({
        status: 'error',
        message: 'Treatment plan not found'
      });
    }

    // Update session count
    if (sessionCompleted) {
      treatmentPlan.schedule.completedSessions += 1;
    }

    // Update phase completion
    if (phaseCompleted !== undefined) {
      if (!treatmentPlan.progress.phases) {
        treatmentPlan.progress.phases = [];
      }
      
      const phaseProgress = {
        phaseIndex: phaseCompleted,
        completion: 100,
        endDate: new Date(),
        notes: req.body.phaseNotes || ''
      };
      
      treatmentPlan.progress.phases.push(phaseProgress);
    }

    // Add assessment
    if (assessment) {
      if (!treatmentPlan.progress.assessments) {
        treatmentPlan.progress.assessments = [];
      }

      const newAssessment = {
        date: new Date(),
        assessedBy: req.user.id,
        ...assessment
      };

      treatmentPlan.progress.assessments.push(newAssessment);
    }

    // Calculate overall progress
    if (treatmentPlan.schedule.totalSessions > 0) {
      treatmentPlan.progress.overall = Math.round(
        (treatmentPlan.schedule.completedSessions / treatmentPlan.schedule.totalSessions) * 100
      );
    }

    // Update status based on progress
    if (treatmentPlan.progress.overall >= 100) {
      treatmentPlan.status = 'completed';
    } else if (treatmentPlan.progress.overall > 0 && treatmentPlan.status === 'draft') {
      treatmentPlan.status = 'active';
    }

    await treatmentPlan.save();

    res.status(200).json({
      status: 'success',
      message: 'Treatment plan progress updated successfully',
      data: { treatmentPlan }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating treatment plan progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get treatment plan statistics
// @route   GET /api/treatment-plans/stats
// @access  Private (Doctor/Admin)
const getTreatmentPlanStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const totalPlans = await TreatmentPlan.countDocuments(query);
    
    const statusDistribution = await TreatmentPlan.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const avgProgress = await TreatmentPlan.aggregate([
      { $match: { ...query, status: 'active' } },
      { $group: { _id: null, avgProgress: { $avg: '$progress.overall' } } }
    ]);

    const completionRate = await TreatmentPlan.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          completionRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalPlans,
        statusDistribution,
        avgProgress: avgProgress[0]?.avgProgress || 0,
        completionRate: completionRate[0]?.completionRate || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching treatment plan statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', validatePagination, getAllTreatmentPlans);
router.get('/stats', authorizeDoctorOrAdmin, getTreatmentPlanStats);
router.get('/:id', validateObjectId, getTreatmentPlan);
router.post('/', authorizeDoctorOrAdmin, validateTreatmentPlan, createTreatmentPlan);
router.put('/:id', authorizeDoctorOrAdmin, validateObjectId, updateTreatmentPlan);
router.patch('/:id/progress', authorizeDoctorOrAdmin, validateObjectId, updateProgress);

module.exports = router;
