import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [userRole, setUserRole] = useState(() => {
    // Get the role from localStorage, default to 'admin' if not found
    return localStorage.getItem('userRole') || 'admin';
  });
  
  // Update localStorage whenever userRole changes
  const updateUserRole = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };
  
  const Dashboard = () => {
    return userRole === 'admin' ? <AdminDashboard /> : <PatientDashboard />;
  };
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginForm 
            role={userRole} 
            onToggleRole={() => updateUserRole(userRole === 'admin' ? 'patient' : 'admin')} 
            onLogin={(role) => updateUserRole(role)}
          />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/*"
          element={
            <Layout userRole={userRole}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                {userRole === 'admin' ? (
                  <>
                    <Route path="/patients" element={<PatientsPage />} />
                    <Route path="/appointments" element={<AppointmentsPage />} />
                    <Route path="/treatments" element={<TreatmentsPage />} />
                    <Route path="/treatment-plans" element={<TreatmentPlansPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </>
                ) : (
                  <>
                    <Route path="/my-appointments" element={<AppointmentsPage />} />
                    <Route path="/my-treatment-plan" element={<TreatmentPlansPage />} />
                    <Route path="/health-records" element={<HealthRecordsPage />} />
                    <Route path="/book-appointment" element={<BookAppointmentPage />} />
                  </>
                )}
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
