const mongoose = require('mongoose');

const treatmentPlanSchema = new mongoose.Schema({
  planId: {
    type: String,
    unique: true,
    required: true
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
  title: {
    type: String,
    required: [true, 'Treatment plan title is required']
  },
  diagnosis: {
    primary: {
      condition: String,
      ayurvedicDiagnosis: String,
      modernDiagnosis: String
    },
    secondary: [{
      condition: String,
      ayurvedicDiagnosis: String,
      modernDiagnosis: String
    }],
    doshicImbalance: {
      vata: { type: Boolean, default: false },
      pitta: { type: Boolean, default: false },
      kapha: { type: Boolean, default: false }
    },
    srotodusti: [String], // Channel blockages
    amaStatus: {
      type: String,
      enum: ['absent', 'mild', 'moderate', 'severe'],
      default: 'absent'
    },
    agniStatus: {
      type: String,
      enum: ['sama', 'vishama', 'tikshna', 'manda'],
      default: 'sama'
    }
  },
  
  // Treatment Goals
  goals: {
    primary: [String],
    secondary: [String],
    shortTerm: [String], // 1-4 weeks
    longTerm: [String]   // 1-6 months
  },
  
  // Treatment Phases
  phases: [{
    name: String,
    description: String,
    duration: Number, // in days
    goals: [String],
    treatments: [{
      treatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatment'
      },
      frequency: String,
      duration: Number, // sessions
      startDate: Date,
      endDate: Date,
      instructions: String,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    medicines: [{
      name: String,
      composition: String,
      dosage: String,
      timing: String,
      duration: String,
      instructions: String,
      prescribedDate: Date
    }],
    lifestyle: {
      diet: [String],
      exercise: [String],
      routine: [String],
      restrictions: [String]
    }
  }],
  
  // Overall Treatment Schedule
  schedule: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: Date,
    totalDuration: Number, // in days
    sessionsPerWeek: Number,
    totalSessions: Number,
    completedSessions: {
      type: Number,
      default: 0
    }
  },
  
  // Dietary Recommendations
  diet: {
    dosha: String, // vata-pacifying, pitta-pacifying, kapha-pacifying
    foods: {
      recommended: [String],
      avoid: [String],
      moderate: [String]
    },
    mealTiming: {
      breakfast: String,
      lunch: String,
      dinner: String
    },
    specialInstructions: [String]
  },
  
  // Lifestyle Recommendations
  lifestyle: {
    dailyRoutine: [{
      time: String,
      activity: String,
      instructions: String
    }],
    exercise: {
      type: [String],
      duration: String,
      frequency: String,
      restrictions: [String]
    },
    sleepSchedule: {
      bedtime: String,
      wakeTime: String,
      duration: String
    },
    stressManagement: [String],
    restrictions: [String]
  },
  
  // Herbal Medicines
  medicines: [{
    name: String,
    sanskritName: String,
    type: {
      type: String,
      enum: ['churna', 'vati', 'kasaya', 'arishtasava', 'taila', 'ghrita', 'bhasma']
    },
    composition: [String],
    properties: {
      rasa: [String], // taste
      virya: String,  // potency
      vipaka: String, // post-digestive effect
      prabhava: String // special effect
    },
    dosage: String,
    anupana: String, // vehicle
    timing: {
      type: String,
      enum: ['before_food', 'after_food', 'with_food', 'empty_stomach', 'bedtime']
    },
    duration: String,
    instructions: String,
    startDate: Date,
    endDate: Date
  }],
  
  // Progress Tracking
  progress: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    phases: [{
      phaseIndex: Number,
      completion: Number,
      startDate: Date,
      endDate: Date,
      notes: String
    }],
    assessments: [{
      date: Date,
      assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      symptoms: {
        improved: [String],
        worsened: [String],
        new: [String]
      },
      dosha: {
        vata: Number,
        pitta: Number,
        kapha: Number
      },
      notes: String,
      recommendations: [String]
    }]
  },
  
  // Follow-up Schedule
  followUp: {
    frequency: String,
    nextDate: Date,
    completed: [{
      date: Date,
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String,
      modifications: [String]
    }]
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'discontinued'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Cost Information
  cost: {
    estimated: Number,
    actual: Number,
    breakdown: [{
      category: String,
      amount: Number,
      description: String
    }]
  },
  
  notes: String,
  modifications: [{
    date: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    changes: String
  }],
  
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

// Indexes (planId already indexed via unique: true)
treatmentPlanSchema.index({ patient: 1 });
treatmentPlanSchema.index({ doctor: 1 });
treatmentPlanSchema.index({ status: 1 });
treatmentPlanSchema.index({ 'schedule.startDate': 1 });
treatmentPlanSchema.index({ 'schedule.endDate': 1 });

// Pre-save middleware to generate plan ID
treatmentPlanSchema.pre('save', async function(next) {
  if (!this.planId) {
    const count = await this.constructor.countDocuments();
    this.planId = `TP${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Virtual for completion percentage
treatmentPlanSchema.virtual('completionPercentage').get(function() {
  if (!this.schedule.totalSessions) return 0;
  return Math.round((this.schedule.completedSessions / this.schedule.totalSessions) * 100);
});

// Virtual to check if plan is active
treatmentPlanSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
