// src/components/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios'; // Using the global axios instance
import AuthLayout from './AuthLayout';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.post('/api/forgot-password', { email });
            setMessage(response.data.message || 'Password reset link sent! Please check your email.');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.email?.[0] || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Forgot Your Password?" subtitle="Enter your email and we'll send you a reset link.">
            <form onSubmit={handleSubmit} className="space-y-6">
                {message && <p className="text-green-600 bg-green-100 p-3 rounded-md text-sm">{message}</p>}
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                        {!loading && <FaPaperPlane className="ml-2 h-4 w-4" />}
                    </button>
                </div>
            </form>
            <p className="mt-8 text-center text-sm text-gray-600">
                Remembered your password?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
