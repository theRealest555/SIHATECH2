// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import PrivateRoute from './components/ui/PrivateRoute';
import { useAuth } from './hooks/useAuth';
import './App.css'; // Assuming you have a global CSS file for styles


// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLogin'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmail')); // Assuming this exists or will be created
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'));


// User specific Profile Pages
const DoctorProfilePage = lazy(() => import('./pages/doctor/Profile'));
const PatientProfilePage = lazy(() => import('./pages/patient/Profile'));
const DoctorCompleteProfilePage = lazy(() => import('./pages/auth/DoctorCompleteProfile'));

// Dashboards
const DashboardPage = lazy(() => import('./pages/Dashboard')); // Generic or role-based redirector
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const DoctorDashboardPage = lazy(() => import('./pages/doctor/DashboardPage'));
const PatientDashboardPage = lazy(() => import('./pages/patient/DashboardPage'));

// Admin Pages
const UserListPage = lazy(() => import('./pages/admin/UserListPage'));
// ... other admin pages

// Doctor Pages
const DoctorAppointmentsPage = lazy(() => import('./pages/doctor/AppointmentsPage'));
const DoctorAvailabilityPage = lazy(() => import('./pages/doctor/AvailabilityPage'));
const DoctorDocumentsPage = lazy(() => import('./pages/doctor/DocumentsPage'));
const DoctorStatisticsPage = lazy(() => import('./pages/doctor/StatisticsPage'));


// Patient Pages
const PatientAppointmentsPage = lazy(() => import('./pages/patient/AppointmentsPage'));
const FindDoctorPage = lazy(() => import('./pages/patient/FindDoctorPage'));
const PublicDoctorProfileViewPage = lazy(() => import('./pages/patient/DoctorProfilePage')); // Public view

// Subscription Pages
const SubscriptionPlansPage = lazy(() => import('./pages/subscriptions/PlansPage'));
const SubscriptionStatusPage = lazy(() => import('./pages/subscriptions/SubscriptionStatusPage'));

// Social Auth Callback
const SocialAuthCallback = lazy(() => import('./components/SocialAuthCallback'));


function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading Application...</div>
        {/* You can use a spinner component here */}
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading page...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="admin/login" element={!user ? <AdminLoginPage /> : <Navigate to="/admin/dashboard" />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} /> {/* Ensure backend route matches */}
          <Route path="email/verify/:id/:hash" element={<VerifyEmailPage />} /> {/* Ensure backend route matches */}
          <Route path="doctors" element={<FindDoctorPage />} /> {/* Public doctor search */}
          <Route path="doctors/:doctorId" element={<PublicDoctorProfileViewPage />} /> {/* Public doctor profile */}
          <Route path="subscription-plans" element={<SubscriptionPlansPage />} />
          <Route path="/auth/:provider/callback" element={<SocialAuthCallback />} />


          {/* Authenticated Routes */}
          <Route path="dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          
          {/* Patient Routes */}
          <Route path="patient/dashboard" element={<PrivateRoute roles={['patient']}><PatientDashboardPage /></PrivateRoute>} />
          <Route path="patient/profile" element={<PrivateRoute roles={['patient']}><PatientProfilePage /></PrivateRoute>} />
          <Route path="patient/appointments" element={<PrivateRoute roles={['patient']}><PatientAppointmentsPage /></PrivateRoute>} />
          
          {/* Doctor Routes */}
          <Route path="doctor/dashboard" element={<PrivateRoute roles={['doctor']}><DoctorDashboardPage /></PrivateRoute>} />
          <Route path="doctor/complete-profile" element={<PrivateRoute roles={['doctor']}><DoctorCompleteProfilePage /></PrivateRoute>} />
          <Route path="doctor/profile" element={<PrivateRoute roles={['doctor']}><DoctorProfilePage /></PrivateRoute>} />
          <Route path="doctor/appointments" element={<PrivateRoute roles={['doctor']}><DoctorAppointmentsPage /></PrivateRoute>} />
          <Route path="doctor/availability" element={<PrivateRoute roles={['doctor']}><DoctorAvailabilityPage /></PrivateRoute>} />
          <Route path="doctor/documents" element={<PrivateRoute roles={['doctor']}><DoctorDocumentsPage /></PrivateRoute>} />
          <Route path="doctor/statistics" element={<PrivateRoute roles={['doctor']}><DoctorStatisticsPage /></PrivateRoute>} />


          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboardPage /></PrivateRoute>} />
          <Route path="admin/users" element={<PrivateRoute roles={['admin']}><UserListPage /></PrivateRoute>} />
          {/* Add other admin routes here: e.g., /admin/doctors-verification, /admin/reports */}

          {/* Subscription Management for Authenticated Users */}
          <Route path="my-subscription" element={<PrivateRoute><SubscriptionStatusPage /></PrivateRoute>} />

          {/* Fallback for authenticated users inside MainLayout */}
          <Route path="*" element={<Navigate to="/" />} /> 
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
