// src/components/layouts/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Corrected path
import { FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa'; // Example icons

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        // Navigation is handled within the logout function in AuthContext
    };

    const getDashboardPath = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin':
                return '/admin/dashboard';
            case 'doctor':
                return '/doctor/dashboard';
            case 'patient':
                return '/patient/dashboard';
            default:
                return '/dashboard'; // A generic dashboard or redirector component
        }
    };
    
    const getProfilePath = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin':
                return '/admin/profile'; // Assuming an admin profile page
            case 'doctor':
                return '/doctor/profile';
            case 'patient':
                return '/patient/profile';
            default:
                return '/profile'; 
        }
    };


    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-indigo-200 transition duration-150">
                           SIHA<span className="text-blue-300">TECH</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:bg-opacity-75 transition duration-150">Home</Link>
                            <Link to="/doctors" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:bg-opacity-75 transition duration-150">Find a Doctor</Link>
                            <Link to="/subscription-plans" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:bg-opacity-75 transition duration-150">Plans</Link>
                            {/* Add more public links as needed */}
                        </div>
                    </div>
                    <div className="hidden md:block">
    <div className="ml-4 flex items-center md:ml-6">
        {user ? (
            <>
                <span className="mr-3 text-sm">
                    Welcome, {user.first_name || user.name || 'User'} ({user.role})
                </span>
                <Link to={getDashboardPath()} className="p-2 rounded-full hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white transition duration-150" title="Dashboard">
                    <FaTachometerAlt className="h-6 w-6" />
                </Link>
                <Link to={getProfilePath()} className="ml-3 p-2 rounded-full hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white transition duration-150" title="Profile">
                    <FaUserCircle className="h-6 w-6" />
                </Link>
                <button
                    onClick={handleLogout}
                    className="ml-3 p-2 rounded-full text-red-300 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white transition duration-150"
                    title="Logout"
                >
                    <FaSignOutAlt className="h-6 w-6" />
                </button>
            </>
        ) : (
            <>
                <Link to="/login" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:bg-opacity-75 transition duration-150">
                    <FaSignInAlt className="mr-1" /> Login
                </Link>
                <Link to="/register" className="flex items-center ml-2 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow transition duration-150">
                   <FaUserPlus className="mr-1" /> Sign Up
                </Link>
            </>
        )}
    </div>
</div>
                    {/* Mobile menu button (implement if needed) */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
