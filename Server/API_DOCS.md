# AyurSutra API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Dashboard
- `GET /dashboard` - Get dashboard data (role-based)

### Patients
- `GET /patients` - Get all patients (with pagination)
- `POST /patients` - Create new patient
- `GET /patients/:id` - Get patient by ID
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient
- `POST /patients/:id/dosha-assessment` - Update dosha assessment
- `GET /patients/:id/history` - Get patient treatment history

### Treatments
- `GET /treatments` - Get all treatments
- `POST /treatments` - Create new treatment
- `GET /treatments/:id` - Get treatment by ID
- `PUT /treatments/:id` - Update treatment
- `DELETE /treatments/:id` - Delete treatment

### Appointments
- `GET /appointments` - Get appointments
- `POST /appointments` - Create appointment
- `GET /appointments/:id` - Get appointment by ID
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment
- `GET /appointments/available-slots` - Get available time slots

### Treatment Plans
- `GET /treatment-plans` - Get treatment plans
- `POST /treatment-plans` - Create treatment plan
- `GET /treatment-plans/:id` - Get treatment plan by ID
- `PUT /treatment-plans/:id` - Update treatment plan
- `DELETE /treatment-plans/:id` - Delete treatment plan

### Health Records
- `GET /health-records` - Get health records
- `POST /health-records` - Create health record
- `GET /health-records/:id` - Get health record by ID
- `PUT /health-records/:id` - Update health record
- `DELETE /health-records/:id` - Delete health record

### Reports & Analytics
- `GET /reports/appointments` - Appointment reports
- `GET /reports/treatments` - Treatment reports
- `GET /reports/financial` - Financial reports
- `GET /reports/patients` - Patient reports

### Users (Admin only)
- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Settings
- `GET /settings` - Get system settings
- `PUT /settings` - Update system settings

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field specific error",
      "value": "invalid_value"
    }
  ]
}
```

## Sample API Calls

### Register User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phone": "9876543210",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ayursutra.com",
    "password": "admin123"
  }'
```

### Get Dashboard Data
```bash
curl -X GET http://localhost:5001/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Patients
```bash
curl -X GET http://localhost:5001/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Appointment
```bash
curl -X POST http://localhost:5001/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patient": "PATIENT_ID",
    "doctor": "DOCTOR_ID",
    "treatment": "TREATMENT_ID",
    "appointmentDate": "2025-09-20T10:00:00.000Z",
    "type": "consultation",
    "notes": "Initial consultation"
  }'
```

## Test Credentials

After running the seed script, you can use these credentials:

- **Admin**: admin@ayursutra.com / admin123
- **Doctor**: rajesh@ayursutra.com / doctor123
- **Patient**: rahul@example.com / patient123

## Frontend Integration

### Setting up Axios Base URL
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Sample React Hook for Authentication
```javascript
import { useState, useEffect } from 'react';
import api from './api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/profile')
        .then(response => {
          setUser(response.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, login, logout, loading };
};
```

## Environment Variables for Production

```bash
# Production MongoDB Atlas URL
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/ayursutra?retryWrites=true&w=majority

# Strong JWT Secret (use a random 64+ character string)
JWT_SECRET=your_production_jwt_secret_key_here

# Production port
PORT=5000

# Production environment
NODE_ENV=production

# Email configuration for notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (for appointment reminders)
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret

# Cloudinary for file uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
