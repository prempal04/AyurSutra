const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  
  // Ayurvedic Assessment
  prakriti: {
    vata: { type: Number, min: 0, max: 100, default: 33 },
    pitta: { type: Number, min: 0, max: 100, default: 33 },
    kapha: { type: Number, min: 0, max: 100, default: 34 },
    dominantDosha: {
      type: String,
      enum: ['vata', 'pitta', 'kapha', 'vata-pitta', 'pitta-kapha', 'vata-kapha', 'tridoshic'],
      default: 'tridoshic'
    },
    assessmentDate: Date,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  vikriti: {
    vata: { type: Number, min: 0, max: 100, default: 33 },
    pitta: { type: Number, min: 0, max: 100, default: 33 },
    kapha: { type: Number, min: 0, max: 100, default: 34 },
    imbalance: String,
    symptoms: [String],
    assessmentDate: Date,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Medical Information
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic', 'monitoring'],
      default: 'active'
    },
    notes: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedDate: {
      type: Date,
      default: Date.now
    }
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    notes: String
  }],
  currentMedications: [{
    name: String,
    type: {
      type: String,
      enum: ['ayurvedic', 'allopathic', 'homeopathic', 'herbal'],
      default: 'ayurvedic'
    },
    dosage: String,
    frequency: String,
    timing: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Lifestyle Information
  lifestyle: {
    diet: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'jain'],
      default: 'vegetarian'
    },
    sleepPattern: {
      averageHours: Number,
      sleepTime: String,
      wakeTime: String,
      quality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good'
      }
    },
    exercise: {
      frequency: {
        type: String,
        enum: ['daily', 'regular', 'occasional', 'none'],
        default: 'regular'
      },
      type: [String],
      duration: Number
    },
    stressLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate'
    },
    habits: {
      smoking: { type: Boolean, default: false },
      alcohol: { type: Boolean, default: false },
      tobacco: { type: Boolean, default: false }
    }
  },
  
  // Health Metrics
  vitals: {
    height: Number, // in cm
    weight: Number, // in kg
    bmi: Number,
    lastUpdated: Date
  },
  
  // Treatment Information
  currentTreatmentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentPlan',
    default: null
  },
  treatmentHistory: [{
    treatmentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreatmentPlan'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['completed', 'discontinued', 'transferred'],
      default: 'completed'
    },
    outcome: String,
    notes: String
  }],
  
  // Appointment Preferences
  appointmentPreferences: {
    preferredTimeSlots: [String],
    preferredDoctors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    reminder: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      advance: { type: Number, default: 24 } // hours
    }
  },
  
  // Additional Information
  notes: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual to calculate BMI
patientSchema.virtual('calculatedBMI').get(function() {
  if (!this.vitals.height || !this.vitals.weight) return null;
  const heightInM = this.vitals.height / 100;
  return (this.vitals.weight / (heightInM * heightInM)).toFixed(1);
});

// Indexes for better performance (user and patientId already indexed via unique: true)
patientSchema.index({ 'prakriti.dominantDosha': 1 });
patientSchema.index({ isActive: 1 });

// Pre-save middleware to generate patient ID
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await this.constructor.countDocuments();
    this.patientId = `PAT${(count + 1).toString().padStart(6, '0')}`;
  }
  
  // Update BMI if height and weight are present
  if (this.vitals.height && this.vitals.weight) {
    const heightInM = this.vitals.height / 100;
    this.vitals.bmi = (this.vitals.weight / (heightInM * heightInM)).toFixed(1);
    this.vitals.lastUpdated = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
