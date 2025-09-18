const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Treatment name is required'],
    trim: true
  },
  sanskritName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['shamana', 'shodhana', 'rasayana', 'satvavajaya'],
    required: [true, 'Treatment category is required']
  },
  subCategory: {
    type: String,
    enum: [
      // Shamana (Palliative)
      'oral_medicines', 'external_applications', 'dietary_therapy',
      // Shodhana (Purification)
      'vamana', 'virechana', 'basti', 'nasya', 'raktamokshana',
      // Rasayana (Rejuvenation)
      'immunity_boosting', 'anti_aging', 'strength_building',
      // Satvavajaya (Psychotherapy)
      'meditation', 'yoga_therapy', 'counseling'
    ]
  },
  description: {
    type: String,
    required: [true, 'Treatment description is required']
  },
  procedure: {
    preparation: String,
    steps: [String],
    postTreatment: String,
    precautions: [String]
  },
  duration: {
    session: Number, // minutes per session
    totalSessions: Number,
    frequency: String, // daily, alternate days, weekly
    totalDuration: Number // total days/weeks
  },
  indications: [String],
  contraindications: [String],
  benefits: [String],
  sideEffects: [String],
  materials: [{
    name: String,
    quantity: String,
    unit: String,
    cost: Number
  }],
  pricing: {
    perSession: {
      type: Number,
      required: [true, 'Per session price is required']
    },
    packagePrice: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  targetDosha: [{
    type: String,
    enum: ['vata', 'pitta', 'kapha']
  }],
  seasonRecommendation: [{
    type: String,
    enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter']
  }],
  ageGroup: {
    min: Number,
    max: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [String],
  videos: [String],
  documents: [String],
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

// Indexes
treatmentSchema.index({ name: 'text', description: 'text', sanskritName: 'text' });
treatmentSchema.index({ category: 1 });
treatmentSchema.index({ subCategory: 1 });
treatmentSchema.index({ targetDosha: 1 });
treatmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Treatment', treatmentSchema);
