// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            switch (user.role) {
                case 'admin':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'doctor':
                     // Check if doctor profile is complete
                    if (user.doctor_profile_completed === false || user.doctor_profile_completed === 0 || !user.doctor_profile_completed) {
                         navigate('/doctor/complete-profile', { replace: true });
                    } else {
                        navigate('/doctor/dashboard', { replace: true });
                    }
                    break;
                case 'patient':
                    navigate('/patient/dashboard', { replace: true });
                    break;
                default:
                    // Fallback for unknown roles or if role is not set
                    console.warn('Unknown user role or role not set, redirecting to home.');
                    navigate('/', { replace: true });
                    break;
            }
        } else if (!loading && !user) {
            // Should not happen if PrivateRoute is working, but as a safeguard
            navigate('/login', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl font-semibold">Loading Dashboard...</div>
                 {/* You can use a spinner component here */}
            </div>
        );
    }

    // This content will likely not be shown due to immediate redirection
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-800">Redirecting to your dashboard...</h1>
        </div>
    );
};

export default DashboardPage;
