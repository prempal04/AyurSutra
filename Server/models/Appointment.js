const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  treatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
    required: [true, 'Treatment is required']
  },
  treatmentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentPlan'
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    start: {
      type: String,
      required: [true, 'Start time is required']
    },
    end: {
      type: String,
      required: [true, 'End time is required']
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'] // in minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation', 'treatment', 'follow-up', 'emergency'],
    default: 'treatment'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  notes: String,
  symptoms: [String],
  
  // Session Details (filled during/after appointment)
  sessionDetails: {
    actualStartTime: Date,
    actualEndTime: Date,
    pulse: {
      vata: String,
      pitta: String,
      kapha: String
    },
    observations: String,
    treatmentGiven: String,
    materialsUsed: [{
      name: String,
      quantity: Number,
      unit: String
    }],
    patientResponse: String,
    nextRecommendations: String,
    homeInstructions: [String]
  },
  
  // Vitals (if recorded during appointment)
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    recordedAt: Date,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'refunded', 'cancelled'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'insurance'],
      default: 'cash'
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date
  },
  
  // Cancellation/Rescheduling
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number
  },
  rescheduling: {
    reason: String,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: Date,
    originalDate: Date,
    originalTimeSlot: {
      start: String,
      end: String
    }
  },
  
  // Reminders
  reminders: {
    sent: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push']
      },
      sentAt: Date,
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed']
      }
    }],
    nextReminder: Date
  },
  
  // Room/Resource allocation
  room: String,
  equipment: [String],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes (appointmentId already indexed via unique: true)
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });
appointmentSchema.index({ 'payment.status': 1 });

// Compound indexes
appointmentSchema.index({ doctor: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1, status: 1 });

// Pre-save middleware to generate appointment ID
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await this.constructor.countDocuments();
    this.appointmentId = `APT${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Virtual to check if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return today.toDateString() === appointmentDate.toDateString();
});

// Virtual to check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return new Date(this.appointmentDate) > new Date();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
