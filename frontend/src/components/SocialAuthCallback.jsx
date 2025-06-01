// src/components/SocialAuthCallback.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios'; // your axios instance

const SocialAuthCallback = () => {
  const { fetchUser, setUser, setLoading: setAuthLoading } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const provider = location.pathname.split('/')[2]; // e.g., 'google' from '/auth/google/callback'
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Sanctum might not use state from client like this, but good to have

    if (!code) {
      console.error('No authorization code found in callback.');
      navigate('/login?error=social_auth_failed');
      return;
    }

    setAuthLoading(true);

    axios.get(`/api/auth/${provider}/callback`, {
      params: {
        code,
        state, // if your backend expects it
      }
    })
    .then(async (response) => {
      // Backend should handle token exchange and set up the session (cookie)
      // Then we fetch the user to confirm session and get user details
      await fetchUser(); // This will set the user in AuthContext
      
      // Determine redirection based on user role or if profile completion is needed
      // This logic might be similar to what's in App.jsx or login success
      // For now, a generic redirect, assuming fetchUser() populates the user object correctly
      const loggedInUser = response.data.user; // Or from fetchUser()
      if (loggedInUser) {
        if (loggedInUser.role === 'doctor' && !loggedInUser.doctor_profile_completed) {
            navigate('/doctor/complete-profile', { replace: true });
        } else if (loggedInUser.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/login?error=social_auth_verification_failed', { replace: true });
      }
    })
    .catch(error => {
      console.error(`Social authentication callback for ${provider} failed:`, error);
      let errorMessage = 'social_auth_failed';
      if (error.response?.data?.message) {
        errorMessage = encodeURIComponent(error.response.data.message);
      }
      navigate(`/login?error=${errorMessage}`, { replace: true });
    })
    .finally(() => {
      setAuthLoading(false);
    });

  }, [navigate, location, searchParams, fetchUser, setUser, setAuthLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Processing your authentication...</h2>
        <p className="text-gray-600">Please wait while we securely log you in.</p>
        {/* You can add a spinner here */}
        <div className="mt-4 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default SocialAuthCallback;
