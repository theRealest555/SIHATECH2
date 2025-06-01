// src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

import { checkAuth } from './redux/slices/authSlice';
import { initializeCSRF } from './api/axios';

// Layout
import MainLayout from './components/layouts/MainLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import VerifyEmail from './pages/auth/VerifyEmail';
import DoctorCompleteProfile from './pages/auth/DoctorCompleteProfile';

// Dashboard + Profiles
import Dashboard from './pages/Dashboard';
import PatientProfile from './pages/patient/Profile';
import DoctorProfile from './pages/doctor/Profile';

// Components used in routes
import PrivateRoute from './components/ui/PrivateRoute';
import DoctorSearch from './components/DoctorSearch';
import DoctorCalendar from './components/DoctorCalendar';
import PatientAppointments from './components/PatientAppointments';
import AppointmentList from './components/AppointmentList';
import ScheduleForm from './components/ScheduleForm';
import LeaveForm from './components/LeaveForm';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Ensure CSRF token is initialized before any requests
    initializeCSRF();

    // Check if the user is already authenticated
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* ======================
            Public (no auth required)
        ======================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ============================================
            All protected routes live under MainLayout
               (only reachable when authenticated)
           ============================================ */}
        <Route path="/" element={<MainLayout />}>
          {/* Doctor Profile Completion (authenticated, but no email‐verification check) */}
          <Route
            path="doctor/complete-profile"
            element={
              <PrivateRoute allowedRoles={['medecin']} requireVerification={false}>
                <DoctorCompleteProfile />
              </PrivateRoute>
            }
          />

          {/* Redirect “/” → “/dashboard” by default */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard (any authenticated user) */}
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* ======================
              Patient‐only routes
             ====================== */}
          <Route path="patient">
            {/* “/patient” → redirect to “/patient/profile” */}
            <Route index element={<Navigate to="profile" replace />} />

            <Route
              path="profile"
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <PatientProfile />
                </PrivateRoute>
              }
            />

            {/* Searching for a doctor */}
            <Route
              path="search"
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <DoctorSearch />
                </PrivateRoute>
              }
            />

            {/* Viewing appointments with a specific doctor */}
            <Route
              path="appointments/:doctorId"
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <AppointmentList />
                </PrivateRoute>
              }
            />
          </Route>

          {/* ======================
              Doctor‐only routes
             ====================== */}
          <Route path="doctor">
            {/* “/doctor” → redirect to “/doctor/profile” */}
            <Route index element={<Navigate to="profile" replace />} />

            <Route
              path="profile"
              element={
                <PrivateRoute allowedRoles={['medecin']}>
                  <DoctorProfile />
                </PrivateRoute>
              }
            />

            {/* Doctor’s personal calendar (no dynamic ID needed: the component can fetch from Redux/auth) */}
            <Route
              path="calendar"
              element={
                <PrivateRoute allowedRoles={['medecin']}>
                  <DoctorCalendar />
                </PrivateRoute>
              }
            />

            {/* If you pass a doctorId explicitly in the URL */}
            <Route
              path="calendar/:doctorId"
              element={
                <PrivateRoute allowedRoles={['medecin']}>
                  <DoctorCalendar />
                </PrivateRoute>
              }
            />

            {/* A doctor viewing appointments for a given patient */}
            <Route
              path="appointments/:doctorId"
              element={
                <PrivateRoute allowedRoles={['medecin']}>
                  <PatientAppointments />
                </PrivateRoute>
              }
            />
          </Route>

          {/* ======================
              Schedule & Leave (Doctor only)
             ====================== */}
          <Route
            path="schedule"
            element={
              <PrivateRoute allowedRoles={['medecin']}>
                <ScheduleForm />
              </PrivateRoute>
            }
          />
          <Route
            path="leaves"
            element={
              <PrivateRoute allowedRoles={['medecin']}>
                <LeaveForm />
              </PrivateRoute>
            }
          />

          {/* If none of the above child‐routes match, redirect to /dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* If the user tries to hit a top‐level route that doesn’t exist, go to /dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default App;
