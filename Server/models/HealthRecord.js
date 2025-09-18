const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  recordType: {
    type: String,
    enum: ['consultation', 'vital_signs', 'lab_report', 'prescription', 'imaging', 'procedure', 'discharge_summary'],
    required: [true, 'Record type is required']
  },
  
  // Consultation Record
  consultation: {
    date: Date,
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    chiefComplaint: String,
    historyOfPresentIllness: String,
    pastMedicalHistory: [String],
    familyHistory: [String],
    socialHistory: String,
    review: {
      cardiovascular: String,
      respiratory: String,
      gastrointestinal: String,
      genitourinary: String,
      neurological: String,
      musculoskeletal: String,
      dermatological: String,
      psychiatric: String
    },
    physicalExamination: {
      general: String,
      vitals: {
        temperature: Number,
        bloodPressure: String,
        heartRate: Number,
        respiratoryRate: Number,
        oxygenSaturation: Number
      },
      systemicExamination: {
        cardiovascular: String,
        respiratory: String,
        abdominal: String,
        neurological: String,
        musculoskeletal: String
      }
    },
    ayurvedicExamination: {
      prakriti: {
        vata: Number,
        pitta: Number,
        kapha: Number
      },
      vikriti: {
        vata: Number,
        pitta: Number,
        kapha: Number
      },
      nadi: String, // pulse
      mala: String, // stool
      mutra: String, // urine
      jivha: String, // tongue
      shabda: String, // voice
      sparsha: String, // touch
      druk: String, // eyes
      aakruti: String // general appearance
    },
    diagnosis: {
      provisional: [String],
      differential: [String],
      final: [String],
      ayurvedicDiagnosis: String
    },
    investigations: [String],
    treatment: {
      immediate: [String],
      ongoing: [String],
      ayurvedicTreatment: [String]
    },
    followUp: String,
    notes: String
  },
  
  // Vital Signs
  vitals: {
    recordedDate: Date,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    height: Number,
    weight: Number,
    bmi: Number,
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    bloodSugar: {
      fasting: Number,
      postPrandial: Number,
      random: Number
    },
    notes: String
  },
  
  // Lab Reports
  labReport: {
    testDate: Date,
    reportDate: Date,
    labName: String,
    testType: {
      type: String,
      enum: ['blood', 'urine', 'stool', 'imaging', 'biopsy', 'culture', 'other']
    },
    tests: [{
      name: String,
      value: String,
      unit: String,
      referenceRange: String,
      status: {
        type: String,
        enum: ['normal', 'abnormal', 'critical']
      }
    }],
    summary: String,
    recommendations: [String],
    attachments: [String] // file URLs
  },
  
  // Prescription
  prescription: {
    prescribedDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    medicines: [{
      name: String,
      type: {
        type: String,
        enum: ['ayurvedic', 'allopathic', 'homeopathic']
      },
      strength: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String,
      quantity: Number
    }],
    lifestyle: [String],
    followUp: String,
    notes: String
  },
  
  // Imaging Reports
  imaging: {
    testDate: Date,
    reportDate: Date,
    facility: String,
    testType: {
      type: String,
      enum: ['x-ray', 'ultrasound', 'ct-scan', 'mri', 'pet-scan', 'mammography', 'other']
    },
    bodyPart: String,
    findings: String,
    impression: String,
    recommendations: [String],
    images: [String], // file URLs
    reportFile: String // PDF URL
  },
  
  // Procedure Records
  procedure: {
    date: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assistants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    procedureName: String,
    indication: String,
    technique: String,
    findings: String,
    complications: String,
    postProcedureCare: [String],
    followUp: String,
    attachments: [String]
  },
  
  // Discharge Summary
  dischargeSummary: {
    admissionDate: Date,
    dischargeDate: Date,
    lengthOfStay: Number,
    admissionDiagnosis: String,
    dischargeDiagnosis: String,
    hospitalCourse: String,
    proceduresPerformed: [String],
    medicationsOnDischarge: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    dischargeInstructions: [String],
    followUpAppointments: [{
      doctor: String,
      date: Date,
      notes: String
    }],
    dietInstructions: [String],
    activityRestrictions: [String]
  },
  
  // Common fields
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date
  }],
  
  tags: [String],
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential'],
    default: 'restricted'
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAccessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAccessedAt: Date
}, {
  timestamps: true
});

// Indexes
healthRecordSchema.index({ patient: 1 });
healthRecordSchema.index({ recordType: 1 });
healthRecordSchema.index({ 'consultation.date': -1 });
healthRecordSchema.index({ 'vitals.recordedDate': -1 });
healthRecordSchema.index({ 'labReport.testDate': -1 });
healthRecordSchema.index({ 'prescription.prescribedDate': -1 });
healthRecordSchema.index({ createdAt: -1 });
healthRecordSchema.index({ tags: 1 });

// Compound indexes
healthRecordSchema.index({ patient: 1, recordType: 1, createdAt: -1 });

// Text search index
healthRecordSchema.index({
  'consultation.chiefComplaint': 'text',
  'consultation.diagnosis.final': 'text',
  'labReport.summary': 'text',
  'prescription.notes': 'text',
  tags: 'text'
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
