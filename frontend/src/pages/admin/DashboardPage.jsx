// src/pages/admin/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserMd, FaFileInvoiceDollar, FaClipboardList, FaUserShield, FaChartBar } from 'react-icons/fa';

const AdminDashboardCard = ({ title, count, icon, linkTo, linkText, color }) => (
    <div className={`bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                {count !== undefined && <p className="text-3xl font-semibold text-gray-900">{count}</p>}
            </div>
            <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('border-', 'bg-')}`}>
                {icon}
            </div>
        </div>
        {linkTo && (
            <div className="mt-4">
                <Link to={linkTo} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    {linkText || 'View Details'} &rarr;
                </Link>
            </div>
        )}
    </div>
);


const AdminDashboardPage = () => {
    // In a real app, fetch these stats from the backend
    const stats = {
        totalUsers: 1250,
        pendingVerifications: 15,
        totalDoctors: 350,
        totalAppointments: 5200,
    };

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminDashboardCard 
                    title="Total Users" 
                    count={stats.totalUsers} 
                    icon={<FaUsers className="h-8 w-8 text-blue-500"/>} 
                    linkTo="/admin/users"
                    linkText="Manage Users"
                    color="border-blue-500"
                />
                <AdminDashboardCard 
                    title="Doctor Verifications" 
                    count={stats.pendingVerifications} 
                    icon={<FaUserMd className="h-8 w-8 text-yellow-500"/>} 
                    linkTo="/admin/doctors-verification" // Create this route & page
                    linkText="Review Applications"
                    color="border-yellow-500"
                />
                <AdminDashboardCard 
                    title="Total Doctors" 
                    count={stats.totalDoctors} 
                    icon={<FaUserMd className="h-8 w-8 text-green-500"/>} 
                    linkTo="/admin/doctors" // Create this route & page for managing doctors
                    linkText="Manage Doctors"
                    color="border-green-500"
                />
                <AdminDashboardCard 
                    title="Total Appointments" 
                    count={stats.totalAppointments} 
                    icon={<FaClipboardList className="h-8 w-8 text-purple-500"/>} 
                    linkTo="/admin/appointments" // Create this route & page
                    linkText="View All Appointments"
                    color="border-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/users/create" className="bg-indigo-600 text-white text-center py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-150">Create New User</Link>
                        <Link to="/admin/admins/create" className="bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition duration-150">Create New Admin</Link>
                        <Link to="/admin/reports" className="bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-150">View Reports</Link>
                        <Link to="/admin/audit-logs" className="bg-gray-700 text-white text-center py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-150">Audit Logs</Link>
                        <Link to="/admin/specialities" className="bg-teal-600 text-white text-center py-3 px-4 rounded-lg hover:bg-teal-700 transition duration-150">Manage Specialities</Link>
                        <Link to="/admin/languages" className="bg-orange-600 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-150">Manage Languages</Link>
                         <Link to="/admin/subscription-plans" className="bg-pink-600 text-white text-center py-3 px-4 rounded-lg hover:bg-pink-700 transition duration-150">Manage Subscriptions</Link>
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <FaChartBar className="mr-2 text-indigo-500" /> System Overview
                    </h2>
                    {/* Placeholder for a small chart or system status */}
                    <p className="text-gray-600">System status: <span className="text-green-500 font-semibold">Operational</span></p>
                    <p className="text-sm text-gray-500 mt-2">More detailed analytics can be integrated here.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;

