// src/services/authService.js
import apiClient from '../api/axios';

export const getCsrfCookie = async () => {
    return apiClient.get('/sanctum/csrf-cookie');
};

// Login, register, logout are handled in AuthContext for now to manage state easily
// but can be moved here if preferred, returning promises.

export const fetchAuthenticatedUser = async () => {
    return apiClient.get('/api/user');
};

export const sendPasswordResetLink = async (email) => {
    await getCsrfCookie();
    return apiClient.post('/api/forgot-password', { email });
};

export const resetPassword = async (data) => {
    // data: { token, email, password, password_confirmation }
    await getCsrfCookie();
    return apiClient.post('/api/reset-password', data);
};

export const resendVerificationEmail = async () => {
    // Assumes user is somewhat authenticated to request this (e.g., logged in but not verified)
    return apiClient.post('/api/email/verification-notification');
};

// src/services/adminService.js
// Placeholder for admin-specific API calls
import apiClient from '../api/axios';

export const getAdminProfile = async () => {
    return apiClient.get('/api/admin/profile');
};

export const getAllUsers = async (params) => { // params for pagination, search
    return apiClient.get('/api/admin/users', { params });
};

export const getUserDetails = async (userId) => {
    return apiClient.get(`/api/admin/users/${userId}`);
};

export const updateUserStatus = async (userId, status) => {
    return apiClient.put(`/api/admin/users/${userId}/status`, { status });
};
// ... more admin functions (deleteUser, resetUserPassword, manageAdmins, doctorVerifications, reports, auditLogs)

// src/services/doctorService.js
// Placeholder for doctor-specific API calls (both doctor-role and public-doctor data)
import apiClient from '../api/axios';

// For Doctor Role
export const getDoctorProfile = async () => {
    return apiClient.get('/api/doctor/profile');
};

export const updateDoctorProfile = async (profileData) => {
    // For multipart/form-data (e.g. profile picture), headers need to be set
    // const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    // return apiClient.post('/api/doctor/profile', profileData, config); // Laravel uses POST for PUT with form-data
    return apiClient.put('/api/doctor/profile', profileData);
};
export const updateDoctorPassword = async (passwordData) => {
    return apiClient.post('/api/doctor/profile/update-password', passwordData);
};
// ... documents, availability, leaves, appointments, statistics

// For Public Doctor Data
export const getPublicDoctorDetails = async (doctorId) => {
    return apiClient.get(`/api/doctors/${doctorId}`);
};
export const searchDoctors = async (params) => { // simple search
    return apiClient.get('/api/doctors/search', { params });
};
export const searchDoctorsAdvanced = async (searchCriteria) => {
    return apiClient.post('/api/doctors/search/advanced', searchCriteria);
};
export const getSpecialities = async () => {
    return apiClient.get('/api/doctors/specialities');
};
export const getLanguages = async () => {
    return apiClient.get('/api/doctors/languages');
};
// ... doctor availability, reviews

// src/services/patientService.js
// Placeholder for patient-specific API calls
import apiClient from '../api/axios';

export const getPatientProfile = async () => {
    return apiClient.get('/api/patient/profile');
};
export const updatePatientProfile = async (profileData) => {
    return apiClient.put('/api/patient/profile', profileData);
};
export const updatePatientPassword = async (passwordData) => {
    return apiClient.post('/api/patient/profile/update-password', passwordData);
};
export const getPatientAppointments = async (params) => {
    return apiClient.get('/api/patient/appointments', { params });
};
export const bookAppointment = async (appointmentData) => {
    return apiClient.post('/api/patient/appointments/book', appointmentData);
};
export const cancelAppointment = async (appointmentId) => {
    return apiClient.put(`/api/patient/appointments/${appointmentId}/cancel`);
};
export const addDoctorReview = async (doctorId, reviewData) => {
    return apiClient.post(`/api/doctors/${doctorId}/reviews`, reviewData);
};


// src/services/subscriptionService.js
import apiClient from '../api/axios';

export const getSubscriptionPlans = async () => {
    return apiClient.get('/api/subscriptions/plans');
};

export const subscribeToPlan = async (planData) => {
    // planData might include plan_id and payment_method_id from Stripe Elements
    return apiClient.post('/api/subscriptions/subscribe', planData);
};

export const cancelCurrentSubscription = async () => {
    return apiClient.post('/api/subscriptions/cancel');
};

export const getUserSubscriptionStatus = async () => {
    return apiClient.get('/api/subscriptions/status');
};

