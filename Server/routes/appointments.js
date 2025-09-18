const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Treatment = require('../models/Treatment');
const TreatmentPlan = require('../models/TreatmentPlan');
const { authorize, authorizeDoctorOrAdmin } = require('../middleware/auth');
const { validateAppointment, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      // Patients can only see their own appointments
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient profile not found'
        });
      }
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      // Doctors can see appointments assigned to them
      query.doctor = req.user.id;
    }
    // Admins can see all appointments (no additional filter)

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.appointmentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      query.appointmentDate = {
        $gte: date,
        $lt: nextDate
      };
    }

    // Filter by today's appointments
    if (req.query.today === 'true') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      query.appointmentDate = {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(tomorrow.setHours(0, 0, 0, 0))
      };
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.appointmentId = searchRegex;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone avatar'
        }
      })
      .populate('doctor', 'firstName lastName email')
      .populate('treatment', 'name category duration pricing')
      .populate('treatmentPlan', 'title planId')
      .sort({ appointmentDate: -1, 'timeSlot.start': 1 })
      .limit(limit * 1)
      .skip(startIndex);

    const total = await Appointment.countDocuments(query);

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
        appointments,
        pagination
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'patientId user prakriti vikriti')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone avatar'
        }
      })
      .populate('doctor', 'firstName lastName email phone')
      .populate('treatment', 'name category description duration pricing')
      .populate('treatmentPlan', 'title planId status')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (appointment.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor._id.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, treatment, appointmentDate, timeSlot, duration, type, notes } = req.body;

    // Verify patient exists
    const patientDoc = await Patient.findById(patient).populate('user');
    if (!patientDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Verify doctor exists and has doctor role
    const doctorDoc = await User.findById(doctor);
    if (!doctorDoc || doctorDoc.role !== 'doctor') {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Verify treatment exists
    const treatmentDoc = await Treatment.findById(treatment);
    if (!treatmentDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'Treatment not found'
      });
    }

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctor,
      appointmentDate: new Date(appointmentDate),
      $or: [
        {
          'timeSlot.start': { $lt: timeSlot.end },
          'timeSlot.end': { $gt: timeSlot.start }
        }
      ],
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor is not available at the selected time slot'
      });
    }

    // Generate appointmentId manually as a temporary fix
    const appointmentCount = await Appointment.countDocuments();
    const appointmentId = `APT${(appointmentCount + 1).toString().padStart(6, '0')}`;

    const appointment = new Appointment({
      appointmentId,
      patient,
      doctor,
      treatment,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      duration: duration || treatmentDoc.duration.session || 60,
      type: type || 'treatment',
      notes,
      payment: {
        amount: treatmentDoc.pricing.perSession
      },
      createdBy: req.user.id
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate('doctor', 'firstName lastName email')
      .populate('treatment', 'name category pricing');

    res.status(201).json({
      status: 'success',
      message: 'Appointment created successfully',
      data: { appointment: populatedAppointment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Check permissions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (appointment.patient.toString() !== patient._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
      // Patients can only update notes and cancel appointments
      const allowedFields = ['notes', 'status'];
      Object.keys(req.body).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
      // Patients can only set status to 'cancelled'
      if (req.body.status && req.body.status !== 'cancelled') {
        delete req.body.status;
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
    }

    // Handle cancellation
    if (req.body.status === 'cancelled') {
      req.body.cancellation = {
        reason: req.body.cancellationReason || 'Cancelled by user',
        cancelledBy: req.user.id,
        cancelledAt: new Date()
      };
    }

    // Handle rescheduling
    if (req.body.appointmentDate || req.body.timeSlot) {
      req.body.rescheduling = {
        reason: req.body.reschedulingReason || 'Rescheduled',
        rescheduledBy: req.user.id,
        rescheduledAt: new Date(),
        originalDate: appointment.appointmentDate,
        originalTimeSlot: appointment.timeSlot
      };
      req.body.status = 'rescheduled';
    }

    req.body.updatedBy = req.user.id;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patient', 'patientId user')
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate('doctor', 'firstName lastName email')
      .populate('treatment', 'name category pricing');

    res.status(200).json({
      status: 'success',
      message: 'Appointment updated successfully',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin/Doctor)
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/availability/:doctorId/:date
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    // Get existing appointments for the doctor on that date
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDay
      },
      status: { $nin: ['cancelled', 'completed'] }
    }).select('timeSlot duration');

    // Define available time slots (9 AM to 6 PM)
    const timeSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        timeSlots.push({
          start: startTime,
          end: endTime,
          available: true
        });
      }
    }

    // Mark unavailable slots
    existingAppointments.forEach(appointment => {
      const appointmentStart = appointment.timeSlot.start;
      const appointmentEnd = appointment.timeSlot.end;
      
      timeSlots.forEach(slot => {
        if (
          (slot.start >= appointmentStart && slot.start < appointmentEnd) ||
          (slot.end > appointmentStart && slot.end <= appointmentEnd) ||
          (slot.start <= appointmentStart && slot.end >= appointmentEnd)
        ) {
          slot.available = false;
        }
      });
    });

    res.status(200).json({
      status: 'success',
      data: {
        date: selectedDate,
        timeSlots: timeSlots.filter(slot => slot.available)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching available slots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor/Admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    // Check permissions
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }
    appointment.updatedBy = req.user.id;

    await appointment.save();

    res.status(200).json({
      status: 'success',
      message: 'Appointment status updated successfully',
      data: { appointment }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating appointment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', validatePagination, getAllAppointments);
router.get('/availability/:doctorId/:date', getAvailableSlots);
router.get('/:id', validateObjectId, getAppointment);
router.post('/', validateAppointment, createAppointment);
router.put('/:id', validateObjectId, updateAppointment);
router.patch('/:id/status', authorizeDoctorOrAdmin, validateObjectId, updateAppointmentStatus);
router.delete('/:id', authorizeDoctorOrAdmin, validateObjectId, deleteAppointment);

module.exports = router;
