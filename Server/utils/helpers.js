const crypto = require('crypto');

// Generate random string
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate patient ID
const generatePatientId = (count) => {
  return `PAT${(count + 1).toString().padStart(6, '0')}`;
};

// Generate appointment ID
const generateAppointmentId = (count) => {
  return `APT${(count + 1).toString().padStart(6, '0')}`;
};

// Generate treatment plan ID
const generateTreatmentPlanId = (count) => {
  return `TP${(count + 1).toString().padStart(6, '0')}`;
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInM = height / 100;
  return (weight / (heightInM * heightInM)).toFixed(1);
};

// Format Indian phone number
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return phone;
};

// Validate Indian phone number
const isValidIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Format currency (Indian Rupees)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Parse date range
const parseDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (end) {
    end.setHours(23, 59, 59, 999);
  }
  
  return { start, end };
};

// Get date range for period
const getDateRangeForPeriod = (period) => {
  const now = new Date();
  let start, end;
  
  switch (period) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      start = new Date(now.setDate(now.getDate() - now.getDay()));
      end = new Date();
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date();
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date();
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date();
      break;
    default:
      start = new Date(now.setDate(now.getDate() - 30));
      end = new Date();
  }
  
  return { start, end };
};

// Sanitize search query
const sanitizeSearchQuery = (query) => {
  if (!query) return '';
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Generate time slots
const generateTimeSlots = (startHour = 9, endHour = 18, intervalMinutes = 30) => {
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endMinute = minute + intervalMinutes;
      const endHour = endMinute >= 60 ? hour + 1 : hour;
      const adjustedEndMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
      const endTime = `${endHour.toString().padStart(2, '0')}:${adjustedEndMinute.toString().padStart(2, '0')}`;
      
      if (endHour <= endHour) {
        slots.push({ start: startTime, end: endTime });
      }
    }
  }
  
  return slots;
};

// Check if time slot conflicts
const checkTimeSlotConflict = (slot1, slot2) => {
  const start1 = slot1.start;
  const end1 = slot1.end;
  const start2 = slot2.start;
  const end2 = slot2.end;
  
  return (start1 < end2 && end1 > start2);
};

// Capitalize first letter
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format name
const formatName = (firstName, lastName) => {
  const first = capitalizeFirst(firstName);
  const last = capitalizeFirst(lastName);
  return `${first} ${last}`.trim();
};

module.exports = {
  generateRandomString,
  generatePatientId,
  generateAppointmentId,
  generateTreatmentPlanId,
  calculateAge,
  calculateBMI,
  formatPhoneNumber,
  isValidIndianPhone,
  formatCurrency,
  parseDateRange,
  getDateRangeForPeriod,
  sanitizeSearchQuery,
  generateTimeSlots,
  checkTimeSlotConflict,
  capitalizeFirst,
  formatName
};
