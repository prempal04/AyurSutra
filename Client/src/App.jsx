import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ProtectedRoute } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import PatientsPage from './components/Pages/PatientsPage';
import AppointmentsPage from './components/Pages/AppointmentsPage';
import TreatmentsPage from './components/Pages/TreatmentsPage';
import TreatmentPlansPage from './components/Pages/TreatmentPlansPage';
import ReportsPage from './components/Pages/ReportsPage';
import SettingsPage from './components/Pages/SettingsPage';
import HealthRecordsPage from './components/Pages/HealthRecordsPage';
import BookAppointmentPage from './components/Pages/BookAppointmentPage';

function LoginPage() {
  const [role, setRole] = useState('admin');
  return (
    <LoginForm 
      role={role} 
      onToggleRole={() => setRole(role === 'admin' ? 'patient' : 'admin')} 
    />
  );
}

function AppRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const userRole = user?.role || 'patient';

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/dashboard" element={
                userRole === 'patient' ? <PatientDashboard /> : <AdminDashboard />
              } />
              
              {/* Admin/Doctor Routes */}
              {(userRole === 'admin' || userRole === 'doctor') && (
                <>
                  <Route path="/patients" element={<PatientsPage />} />
                  <Route path="/appointments" element={<AppointmentsPage />} />
                  <Route path="/treatments" element={<TreatmentsPage />} />
                  <Route path="/treatment-plans" element={<TreatmentPlansPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/health-records" element={<HealthRecordsPage />} />
                </>
              )}
              
              {/* Patient Routes */}
              {userRole === 'patient' && (
                <>
                  <Route path="/book-appointment" element={<BookAppointmentPage />} />
                  <Route path="/my-appointments" element={<AppointmentsPage />} />
                  <Route path="/my-health-records" element={<HealthRecordsPage />} />
                  <Route path="/my-treatment-plans" element={<TreatmentPlansPage />} />
                </>
              )}
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
