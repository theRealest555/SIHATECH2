// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios'; // Your configured axios instance
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial loading state for user check
    const [authError, setAuthError] = useState(null);
    const navigate = useNavigate();

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setAuthError(null);
        try {
            // Check if a token/session might exist (e.g. from previous login)
            // Sanctum typically relies on cookies, but an initial /api/user call can verify
            const response = await axios.get('/api/user');
            setUser(response.data);
        } catch (error) {
            setUser(null);
            if (error.response && error.response.status === 401) {
                // Not authenticated, this is expected if no session
            } else {
                console.error('Failed to fetch user:', error);
                // setAuthError('Failed to verify session.'); // Optional: show error
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (credentials, isAdmin = false) => {
        setLoading(true);
        setAuthError(null);
        try {
            await axios.get('/sanctum/csrf-cookie'); // Important for Sanctum
            const loginUrl = isAdmin ? '/api/admin/login' : '/api/login';
            const response = await axios.post(loginUrl, credentials);
            
            // After login, fetch user data to confirm and get roles/details
            await fetchUser(); 

            // Navigation based on role after fetching user
            // This logic might need to be more sophisticated based on response.data from login
            // or the fetched user data
            // For now, assuming fetchUser() sets the user and we can navigate from App.jsx or Navbar
            
            return true; // Indicate success
        } catch (error) {
            console.error('Login failed:', error);
            setUser(null);
            setAuthError(error.response?.data?.message || 'Login failed. Please check your credentials.');
            return false; // Indicate failure
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setAuthError(null);
        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/register', userData);
            // After registration, attempt to fetch the user (they might be auto-logged in or need to verify email)
            await fetchUser(); 
            // Depending on flow, navigate to login, email verification, or dashboard
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            setAuthError(error.response?.data?.message || 'Registration failed.');
            if (error.response?.data?.errors) {
                 setAuthError(Object.values(error.response.data.errors).join(', '));
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        setAuthError(null);
        try {
            // Determine logout endpoint based on user role if necessary
            // For simplicity, assuming a general logout or admin-specific if user.role === 'admin'
            const logoutUrl = user?.role === 'admin' ? '/api/admin/logout' : '/api/logout';
            await axios.post(logoutUrl);
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if API logout fails, clear client-side state
            // setAuthError('Logout failed on server, but session cleared locally.');
        } finally {
            setUser(null);
            setLoading(false);
            navigate('/login'); // Redirect to login after logout
        }
    };
    
    // Function to complete doctor profile
    const completeDoctorProfile = async (profileData) => {
        setLoading(true);
        setAuthError(null);
        try {
            // Assuming the endpoint requires authentication
            const response = await axios.post('/api/doctor/complete-profile', profileData);
            // Optionally update user state if the response contains updated user info
            setUser(prevUser => ({ ...prevUser, ...response.data.user, doctor_profile_completed: true }));
            await fetchUser(); // Re-fetch user to get the latest state
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Failed to complete doctor profile:', error);
            setAuthError(error.response?.data?.message || 'Failed to complete profile.');
            return { success: false, error: error.response?.data };
        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthContext.Provider value={{ user, loading, authError, login, register, logout, fetchUser, completeDoctorProfile, setLoading, setUser, setAuthError }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
