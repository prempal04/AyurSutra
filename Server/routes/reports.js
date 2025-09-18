const express = require('express');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const TreatmentPlan = require('../models/TreatmentPlan');
const Treatment = require('../models/Treatment');
const HealthRecord = require('../models/HealthRecord');
const { authorize, authorizeDoctorOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get comprehensive analytics report
// @route   GET /api/reports/analytics
// @access  Private (Admin/Doctor)
const getAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      dateFilter = { $gte: sixMonthsAgo };
    }

    // Patient Analytics
    const patientAnalytics = await Patient.aggregate([
      {
        $match: {
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            ...(period === 'day' && { day: { $dayOfMonth: '$createdAt' } })
          },
          newPatients: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Appointment Analytics
    const appointmentAnalytics = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue Analytics
    const revenueAnalytics = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: dateFilter,
          'payment.status': 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' }
          },
          totalRevenue: { $sum: '$payment.paidAmount' },
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Treatment Popularity
    const treatmentPopularity = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: dateFilter
        }
      },
      {
        $group: {
          _id: '$treatment',
          appointmentCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$payment.status', 'paid'] },
                '$payment.paidAmount',
                0
              ]
            }
          }
        }
      },
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
          treatment: '$treatment.name',
          category: '$treatment.category',
          appointmentCount: 1,
          completedCount: 1,
          totalRevenue: 1,
          successRate: {
            $cond: [
              { $eq: ['$appointmentCount', 0] },
              0,
              { $multiply: [{ $divide: ['$completedCount', '$appointmentCount'] }, 100] }
            ]
          }
        }
      },
      { $sort: { appointmentCount: -1 } }
    ]);

    // Doctor Performance
    const doctorPerformance = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: dateFilter
        }
      },
      {
        $group: {
          _id: '$doctor',
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$payment.status', 'paid'] },
                '$payment.paidAmount',
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $project: {
          doctorName: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] },
          totalAppointments: 1,
          completedAppointments: 1,
          cancelledAppointments: 1,
          totalRevenue: 1,
          completionRate: {
            $cond: [
              { $eq: ['$totalAppointments', 0] },
              0,
              { $multiply: [{ $divide: ['$completedAppointments', '$totalAppointments'] }, 100] }
            ]
          }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        period: {
          startDate: startDate || sixMonthsAgo,
          endDate: endDate || new Date(),
          period
        },
        patientAnalytics,
        appointmentAnalytics,
        revenueAnalytics,
        treatmentPopularity,
        doctorPerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error generating analytics report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get financial report
// @route   GET /api/reports/financial
// @access  Private (Admin only)
const getFinancialReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Monthly revenue breakdown
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$payment.status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment.amount' },
          paidAmount: { $sum: '$payment.paidAmount' }
        }
      }
    ]);

    // Revenue by treatment category
    const revenueByCategory = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate },
          'payment.status': 'paid'
        }
      },
      {
        $lookup: {
          from: 'treatments',
          localField: 'treatment',
          foreignField: '_id',
          as: 'treatment'
        }
      },
      { $unwind: '$treatment' },
      {
        $group: {
          _id: '$treatment.category',
          revenue: { $sum: '$payment.paidAmount' },
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Daily revenue trend
    const dailyRevenue = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate },
          'payment.status': 'paid'
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$appointmentDate' },
          revenue: { $sum: '$payment.paidAmount' },
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Outstanding payments
    const outstandingPayments = await Appointment.find({
      'payment.status': { $in: ['pending', 'partial'] }
    })
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName email phone' }
      })
      .populate('treatment', 'name category')
      .select('appointmentId appointmentDate payment')
      .sort({ appointmentDate: -1 });

    // Payment method breakdown
    const paymentMethods = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate },
          'payment.status': 'paid'
        }
      },
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          amount: { $sum: '$payment.paidAmount' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        period: { year: currentYear, month: currentMonth },
        monthlyRevenue,
        revenueByCategory,
        dailyRevenue,
        outstandingPayments,
        paymentMethods
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error generating financial report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get patient demographics report
// @route   GET /api/reports/demographics
// @access  Private (Admin/Doctor)
const getDemographicsReport = async (req, res) => {
  try {
    // Age distribution
    const ageDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
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
                { case: { $lt: ['$age', 18] }, then: '0-17' },
                { case: { $lt: ['$age', 30] }, then: '18-29' },
                { case: { $lt: ['$age', 45] }, then: '30-44' },
                { case: { $lt: ['$age', 60] }, then: '45-59' },
                { case: { $gte: ['$age', 60] }, then: '60+' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Gender distribution
    const genderDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Dosha distribution
    const doshaDistribution = await Patient.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$prakriti.dominantDosha', count: { $sum: 1 } } }
    ]);

    // Common conditions
    const commonConditions = await Patient.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$medicalHistory' },
      {
        $group: {
          _id: '$medicalHistory.condition',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Blood group distribution
    const bloodGroupDistribution = await Patient.aggregate([
      { $match: { isActive: true, bloodGroup: { $exists: true, $ne: null } } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);

    // Geographic distribution (by state)
    const geographicDistribution = await Patient.aggregate([
      { $match: { isActive: true, 'address.state': { $exists: true, $ne: null } } },
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        ageDistribution,
        genderDistribution,
        doshaDistribution,
        commonConditions,
        bloodGroupDistribution,
        geographicDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error generating demographics report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get treatment outcomes report
// @route   GET /api/reports/outcomes
// @access  Private (Admin/Doctor)
const getTreatmentOutcomesReport = async (req, res) => {
  try {
    // Treatment plan completion rates
    const completionRates = await TreatmentPlan.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average treatment duration
    const treatmentDurations = await TreatmentPlan.aggregate([
      { $match: { status: 'completed' } },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$schedule.endDate', '$schedule.startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' }
        }
      }
    ]);

    // Success rates by treatment category
    const successRatesByCategory = await TreatmentPlan.aggregate([
      {
        $lookup: {
          from: 'treatments',
          localField: 'phases.treatments.treatment',
          foreignField: '_id',
          as: 'treatmentDetails'
        }
      },
      { $unwind: '$treatmentDetails' },
      {
        $group: {
          _id: '$treatmentDetails.category',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          completed: 1,
          successRate: {
            $multiply: [{ $divide: ['$completed', '$total'] }, 100]
          }
        }
      }
    ]);

    // Patient satisfaction scores (if available in assessments)
    const satisfactionScores = await TreatmentPlan.aggregate([
      { $unwind: '$progress.assessments' },
      { $match: { 'progress.assessments.satisfactionScore': { $exists: true } } },
      {
        $group: {
          _id: null,
          avgSatisfaction: { $avg: '$progress.assessments.satisfactionScore' },
          totalAssessments: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        completionRates,
        treatmentDurations: treatmentDurations[0] || {},
        successRatesByCategory,
        satisfactionScores: satisfactionScores[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error generating treatment outcomes report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/analytics', authorizeDoctorOrAdmin, getAnalyticsReport);
router.get('/financial', authorize('admin'), getFinancialReport);
router.get('/demographics', authorizeDoctorOrAdmin, getDemographicsReport);
router.get('/outcomes', authorizeDoctorOrAdmin, getTreatmentOutcomesReport);

module.exports = router;
