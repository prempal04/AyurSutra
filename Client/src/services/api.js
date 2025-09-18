// API Configuration for AyurSutra Frontend
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.config?.url, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    
    // Create a consistent error object
    const errorObj = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data
    };
    
    return Promise.reject(errorObj);
  }
);

// API Methods
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

export const patientsAPI = {
  getPatients: (params = {}) => api.get('/patients', { params }),
  getPatient: (id) => api.get(`/patients/${id}`),
  createPatient: (patientData) => api.post('/patients', patientData),
  updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  updateDoshaAssessment: (id, assessment) => api.post(`/patients/${id}/dosha-assessment`, assessment),
  getPatientHistory: (id) => api.get(`/patients/${id}/history`),
};

export const treatmentsAPI = {
  getTreatments: (params = {}) => api.get('/treatments', { params }),
  getTreatment: (id) => api.get(`/treatments/${id}`),
  createTreatment: (treatmentData) => api.post('/treatments', treatmentData),
  updateTreatment: (id, treatmentData) => api.put(`/treatments/${id}`, treatmentData),
  deleteTreatment: (id) => api.delete(`/treatments/${id}`),
};

export const appointmentsAPI = {
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (params) => api.get('/appointments/available-slots', { params }),
};

export const treatmentPlansAPI = {
  getTreatmentPlans: (params = {}) => api.get('/treatment-plans', { params }),
  getTreatmentPlan: (id) => api.get(`/treatment-plans/${id}`),
  createTreatmentPlan: (planData) => api.post('/treatment-plans', planData),
  updateTreatmentPlan: (id, planData) => api.put(`/treatment-plans/${id}`, planData),
  deleteTreatmentPlan: (id) => api.delete(`/treatment-plans/${id}`),
};

export const healthRecordsAPI = {
  getHealthRecords: (params = {}) => api.get('/health-records', { params }),
  getHealthRecord: (id) => api.get(`/health-records/${id}`),
  createHealthRecord: (recordData) => api.post('/health-records', recordData),
  updateHealthRecord: (id, recordData) => api.put(`/health-records/${id}`, recordData),
  deleteHealthRecord: (id) => api.delete(`/health-records/${id}`),
};

export const reportsAPI = {
  getAppointmentReports: (params = {}) => api.get('/reports/appointments', { params }),
  getTreatmentReports: (params = {}) => api.get('/reports/treatments', { params }),
  getFinancialReports: (params = {}) => api.get('/reports/financial', { params }),
  getPatientReports: (params = {}) => api.get('/reports/patients', { params }),
};

export const usersAPI = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
};

export default api;
