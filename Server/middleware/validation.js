const { body, param, query, validationResult } = require('express-validator');

// Custom validation middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'patient'])
    .withMessage('Role must be admin, doctor, or patient'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Patient validation rules
const validatePatient = [
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('Age must be between 0 and 120 years');
      }
      return true;
    }),
  
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
  
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  
  body('emergencyContact.phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  handleValidationErrors
];

// Appointment validation rules
const validateAppointment = [
  body('patient')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  
  body('doctor')
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  
  body('treatment')
    .isMongoId()
    .withMessage('Please provide a valid treatment ID'),
  
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate < now) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  
  body('timeSlot.start')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid start time in HH:MM format'),
  
  body('timeSlot.end')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid end time in HH:MM format')
    .custom((value, { req }) => {
      const startTime = req.body.timeSlot?.start;
      if (startTime && value <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  
  body('type')
    .optional()
    .isIn(['consultation', 'treatment', 'follow-up', 'emergency'])
    .withMessage('Type must be consultation, treatment, follow-up, or emergency'),
  
  handleValidationErrors
];

// Treatment validation rules
const validateTreatment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Treatment name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Treatment name must be between 2 and 200 characters'),
  
  body('category')
    .isIn(['shamana', 'shodhana', 'rasayana', 'satvavajaya'])
    .withMessage('Category must be shamana, shodhana, rasayana, or satvavajaya'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Treatment description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('pricing.perSession')
    .isFloat({ min: 0 })
    .withMessage('Per session price must be a positive number'),
  
  body('duration.session')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Session duration must be between 15 and 480 minutes'),
  
  handleValidationErrors
];

// Treatment Plan validation rules
const validateTreatmentPlan = [
  body('patient')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Treatment plan title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('schedule.startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('schedule.totalDuration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Total duration must be between 1 and 365 days'),
  
  handleValidationErrors
];

// Health Record validation rules
const validateHealthRecord = [
  body('patient')
    .isMongoId()
    .withMessage('Please provide a valid patient ID'),
  
  body('recordType')
    .isIn(['consultation', 'vital_signs', 'lab_report', 'prescription', 'imaging', 'procedure', 'discharge_summary'])
    .withMessage('Please provide a valid record type'),
  
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid ID'),
  
  handleValidationErrors
];

// Query validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('Sort must be asc, desc, 1, or -1'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePatient,
  validateAppointment,
  validateTreatment,
  validateTreatmentPlan,
  validateHealthRecord,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};
