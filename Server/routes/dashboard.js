const express = require('express');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const TreatmentPlan = require('../models/TreatmentPlan');
const HealthRecord = require('../models/HealthRecord');
const Treatment = require('../models/Treatment');
const { authorizeDoctorOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Overview Stats
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const totalAppointments = await Appointment.countDocuments();
    const activeTreatmentPlans = await TreatmentPlan.countDocuments({ status: 'active' });

    // Today's appointments
    const todaysAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName avatar' }
      })
      .populate('doctor', 'firstName lastName')
      .populate('treatment', 'name category')
      .sort({ 'timeSlot.start': 1 });

    // Monthly revenue calculation
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startOfMonth },
          'payment.status': 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.paidAmount' }
        }
      }
    ]);

    // Patient growth (last 6 months)
    const patientGrowth = await Patient.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Appointment status distribution
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top treatments
    const topTreatments = await Appointment.aggregate([
      {
        $group: {
          _id: '$treatment',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'treatments',
          localField: '_id',
          foreignField: '_id',
          as: 'treatment'
        }
      },
      { $unwind: '$treatment' }
    ]);

    // Recent activity
    const recentActivities = await HealthRecord.find()
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          activeTreatmentPlans,
          monthlyRevenue: monthlyRevenue[0]?.total || 0
        },
        todaysAppointments,
        patientGrowth,
        appointmentStats,
        topTreatments,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching admin dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get patient dashboard data
// @route   GET /api/dashboard/patient
// @access  Private (Patient only)
const getPatientDashboard = async (req, res) => {
  try {
    // Get patient profile
    const patient = await Patient.findOne({ user: req.user.id })
      .populate('currentTreatmentPlan')
      .populate('user', 'firstName lastName email phone avatar');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient profile not found'
      });
    }

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patient: patient._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('doctor', 'firstName lastName')
      .populate('treatment', 'name category duration')
      .sort({ appointmentDate: 1 })
      .limit(5);

    // Recent appointments
    const recentAppointments = await Appointment.find({
      patient: patient._id,
      status: 'completed'
    })
      .populate('doctor', 'firstName lastName')
      .populate('treatment', 'name category')
      .sort({ appointmentDate: -1 })
      .limit(5);

    // Health records summary
    const healthRecordsSummary = await HealthRecord.aggregate([
      { $match: { patient: patient._id } },
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 },
          latest: { $max: '$createdAt' }
        }
      }
    ]);

    // Treatment progress
    let treatmentProgress = null;
    if (patient.currentTreatmentPlan) {
      treatmentProgress = await TreatmentPlan.findById(patient.currentTreatmentPlan)
        .select('title status progress schedule phases');
    }

    // Wellness metrics (based on recent health records)
    const latestVitals = await HealthRecord.findOne({
      patient: patient._id,
      recordType: 'vital_signs'
    }).sort({ 'vitals.recordedDate': -1 });

    // Medication reminders (active prescriptions)
    const activeMedications = await HealthRecord.find({
      patient: patient._id,
      recordType: 'prescription'
    })
      .sort({ 'prescription.prescribedDate': -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        patient,
        upcomingAppointments,
        recentAppointments,
        healthRecordsSummary,
        treatmentProgress,
        latestVitals,
        activeMedications
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching patient dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get doctor dashboard data
// @route   GET /api/dashboard/doctor
// @access  Private (Doctor only)
const getDoctorDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's appointments
    const todaysAppointments = await Appointment.find({
      doctor: req.user.id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName avatar' }
      })
      .populate('treatment', 'name category duration')
      .sort({ 'timeSlot.start': 1 });

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctor: req.user.id,
      appointmentDate: { $gt: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate('treatment', 'name category')
      .sort({ appointmentDate: 1 })
      .limit(10);

    // My patients
    const myPatients = await TreatmentPlan.find({ doctor: req.user.id })
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName avatar' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Statistics
    const totalPatients = await TreatmentPlan.countDocuments({ doctor: req.user.id });
    const totalAppointments = await Appointment.countDocuments({ doctor: req.user.id });
    const completedAppointments = await Appointment.countDocuments({
      doctor: req.user.id,
      status: 'completed'
    });
    const monthlyAppointments = await Appointment.countDocuments({
      doctor: req.user.id,
      appointmentDate: { $gte: startOfMonth }
    });

    // Treatment plan statistics
    const treatmentPlanStats = await TreatmentPlan.aggregate([
      { $match: { doctor: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent health records
    const recentRecords = await HealthRecord.find({
      $or: [
        { createdBy: req.user.id },
        { 'consultation.doctor': req.user.id },
        { 'prescription.prescribedBy': req.user.id }
      ]
    })
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        todaysAppointments,
        upcomingAppointments,
        myPatients,
        statistics: {
          totalPatients,
          totalAppointments,
          completedAppointments,
          monthlyAppointments
        },
        treatmentPlanStats,
        recentRecords
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching doctor dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get dashboard data based on user role
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    switch (req.user.role) {
      case 'admin':
        return getAdminDashboard(req, res);
      case 'doctor':
        return getDoctorDashboard(req, res);
      case 'patient':
        return getPatientDashboard(req, res);
      default:
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', getDashboard);
router.get('/admin', authorizeDoctorOrAdmin, getAdminDashboard);
router.get('/doctor', getDoctorDashboard);
router.get('/patient', getPatientDashboard);

module.exports = router;
