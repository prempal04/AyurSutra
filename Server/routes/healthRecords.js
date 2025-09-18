const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const Patient = require('../models/Patient');
const { authorize, authorizeDoctorOrAdmin } = require('../middleware/auth');
const { validateHealthRecord, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all health records
// @route   GET /api/health-records
// @access  Private
const getAllHealthRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      // Patients can only see their own health records
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient profile not found'
        });
      }
      query.patient = patient._id;
    }

    // Filter by patient (for doctors/admin)
    if (req.query.patient && req.user.role !== 'patient') {
      query.patient = req.query.patient;
    }

    // Filter by record type
    if (req.query.recordType) {
      query.recordType = req.query.recordType;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Access level filter
    if (req.user.role !== 'admin') {
      query.accessLevel = { $ne: 'confidential' };
    }

    const healthRecords = await HealthRecord.find(query)
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate('consultation.doctor', 'firstName lastName')
      .populate('vitals.recordedBy', 'firstName lastName')
      .populate('prescription.prescribedBy', 'firstName lastName')
      .populate('procedure.performedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await HealthRecord.countDocuments(query);

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
        healthRecords,
        pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching health records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single health record
// @route   GET /api/health-records/:id
// @access  Private
const getHealthRecord = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id)
      .populate('patient', 'patientId user prakriti vikriti')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate('consultation.doctor', 'firstName lastName email')
      .populate('vitals.recordedBy', 'firstName lastName')
      .populate('prescription.prescribedBy', 'firstName lastName')
      .populate('procedure.performedBy', 'firstName lastName')
      .populate('procedure.assistants', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!healthRecord) {
      return res.status(404).json({
        status: 'error',
        message: 'Health record not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (healthRecord.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
    }

    // Check access level
    if (healthRecord.accessLevel === 'confidential' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. This record is confidential.'
      });
    }

    // Update last accessed info
    healthRecord.lastAccessedBy = req.user.id;
    healthRecord.lastAccessedAt = new Date();
    await healthRecord.save();

    res.status(200).json({
      status: 'success',
      data: { healthRecord }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching health record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new health record
// @route   POST /api/health-records
// @access  Private (Doctor/Admin)
const createHealthRecord = async (req, res) => {
  try {
    const { patient, recordType, ...recordData } = req.body;

    // Verify patient exists
    const patientDoc = await Patient.findById(patient);
    if (!patientDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Set the doctor field for consultation records
    if (recordType === 'consultation' && recordData.consultation) {
      recordData.consultation.doctor = req.user.id;
    }

    // Set the recordedBy field for vitals
    if (recordType === 'vital_signs' && recordData.vitals) {
      recordData.vitals.recordedBy = req.user.id;
      recordData.vitals.recordedDate = new Date();
    }

    // Set the prescribedBy field for prescriptions
    if (recordType === 'prescription' && recordData.prescription) {
      recordData.prescription.prescribedBy = req.user.id;
      recordData.prescription.prescribedDate = new Date();
    }

    // Set the performedBy field for procedures
    if (recordType === 'procedure' && recordData.procedure) {
      recordData.procedure.performedBy = req.user.id;
      recordData.procedure.date = recordData.procedure.date || new Date();
    }

    const healthRecord = await HealthRecord.create({
      patient,
      recordType,
      ...recordData,
      createdBy: req.user.id
    });

    const populatedHealthRecord = await HealthRecord.findById(healthRecord._id)
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      status: 'success',
      message: 'Health record created successfully',
      data: { healthRecord: populatedHealthRecord }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating health record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update health record
// @route   PUT /api/health-records/:id
// @access  Private (Doctor/Admin)
const updateHealthRecord = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        status: 'error',
        message: 'Health record not found'
      });
    }

    // Check if user can update this record
    if (req.user.role === 'doctor' && healthRecord.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update records you created.'
      });
    }

    const updatedHealthRecord = await HealthRecord.findByIdAndUpdate(
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
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      message: 'Health record updated successfully',
      data: { healthRecord: updatedHealthRecord }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating health record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete health record
// @route   DELETE /api/health-records/:id
// @access  Private (Admin only)
const deleteHealthRecord = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);

    if (!healthRecord) {
      return res.status(404).json({
        status: 'error',
        message: 'Health record not found'
      });
    }

    await HealthRecord.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting health record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get patient's medical summary
// @route   GET /api/health-records/summary/:patientId
// @access  Private (Doctor/Admin)
const getPatientSummary = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await Patient.findById(patientId).populate('user', 'firstName lastName');
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Get recent consultations
    const recentConsultations = await HealthRecord.find({
      patient: patientId,
      recordType: 'consultation'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('consultation.doctor', 'firstName lastName');

    // Get latest vitals
    const latestVitals = await HealthRecord.findOne({
      patient: patientId,
      recordType: 'vital_signs'
    })
      .sort({ 'vitals.recordedDate': -1 });

    // Get recent lab reports
    const recentLabReports = await HealthRecord.find({
      patient: patientId,
      recordType: 'lab_report'
    })
      .sort({ 'labReport.testDate': -1 })
      .limit(5);

    // Get active prescriptions
    const activePrescriptions = await HealthRecord.find({
      patient: patientId,
      recordType: 'prescription'
    })
      .sort({ 'prescription.prescribedDate': -1 })
      .limit(10);

    // Get record statistics
    const recordStats = await HealthRecord.aggregate([
      { $match: { patient: patient._id } },
      { $group: { _id: '$recordType', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        patient,
        recentConsultations,
        latestVitals,
        recentLabReports,
        activePrescriptions,
        recordStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get health record statistics
// @route   GET /api/health-records/stats
// @access  Private (Admin/Doctor)
const getHealthRecordStats = async (req, res) => {
  try {
    let query = {};
    
    // If doctor, only show records they created or are associated with
    if (req.user.role === 'doctor') {
      query.$or = [
        { createdBy: req.user.id },
        { 'consultation.doctor': req.user.id },
        { 'vitals.recordedBy': req.user.id },
        { 'prescription.prescribedBy': req.user.id },
        { 'procedure.performedBy': req.user.id }
      ];
    }

    const totalRecords = await HealthRecord.countDocuments(query);
    
    const recordTypeDistribution = await HealthRecord.aggregate([
      { $match: query },
      { $group: { _id: '$recordType', count: { $sum: 1 } } }
    ]);

    const recordsThisMonth = await HealthRecord.countDocuments({
      ...query,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const accessLevelDistribution = await HealthRecord.aggregate([
      { $match: query },
      { $group: { _id: '$accessLevel', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalRecords,
        recordTypeDistribution,
        recordsThisMonth,
        accessLevelDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching health record statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', validatePagination, getAllHealthRecords);
router.get('/stats', authorizeDoctorOrAdmin, getHealthRecordStats);
router.get('/summary/:patientId', authorizeDoctorOrAdmin, validateObjectId, getPatientSummary);
router.get('/:id', validateObjectId, getHealthRecord);
router.post('/', authorizeDoctorOrAdmin, validateHealthRecord, createHealthRecord);
router.put('/:id', authorizeDoctorOrAdmin, validateObjectId, updateHealthRecord);
router.delete('/:id', authorize('admin'), validateObjectId, deleteHealthRecord);

module.exports = router;
