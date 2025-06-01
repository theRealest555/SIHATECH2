// src/pages/doctor/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUserInjured, FaClock, FaFileMedicalAlt, FaChartLine, FaDollarSign } from 'react-icons/fa';

const DoctorDashboardCard = ({ title, value, icon, linkTo, linkText, color }) => (
     <div className={`bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                {value !== undefined && <p className="text-3xl font-semibold text-gray-900">{value}</p>}
            </div>
             <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('border-', 'bg-')}`}>
                {icon}
            </div>
        </div>
        {linkTo && (
            <div className="mt-4">
                <Link to={linkTo} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    {linkText || 'Manage'} &rarr;
                </Link>
            </div>
        )}
    </div>
);


const DoctorDashboardPage = () => {
    // Fetch actual data in a real app
    const doctorStats = {
        upcomingAppointments: 5,
        totalPatients: 120, // Example
        pendingDocuments: 1, // Example
    };

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctor Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 <DoctorDashboardCard 
                    title="Upcoming Appointments" 
                    value={doctorStats.upcomingAppointments} 
                    icon={<FaCalendarAlt className="h-8 w-8 text-blue-500"/>} 
                    linkTo="/doctor/appointments"
                    color="border-blue-500"
                />
                <DoctorDashboardCard 
                    title="Manage Availability" 
                    icon={<FaClock className="h-8 w-8 text-green-500"/>} 
                    linkTo="/doctor/availability"
                    color="border-green-500"
                />
                <DoctorDashboardCard 
                    title="My Documents" 
                    value={doctorStats.pendingDocuments > 0 ? `${doctorStats.pendingDocuments} pending` : 'All Clear'}
                    icon={<FaFileMedicalAlt className="h-8 w-8 text-yellow-500"/>} 
                    linkTo="/doctor/documents"
                    color="border-yellow-500"
                />
                 <DoctorDashboardCard 
                    title="Patient Records" // This would link to a patient management section if it exists
                    icon={<FaUserInjured className="h-8 w-8 text-red-500"/>} 
                    linkTo="/doctor/patients" // Placeholder - create if needed
                    linkText="View Patients"
                    color="border-red-500"
                />
                 <DoctorDashboardCard 
                    title="My Statistics" 
                    icon={<FaChartLine className="h-8 w-8 text-purple-500"/>} 
                    linkTo="/doctor/statistics"
                    color="border-purple-500"
                />
                 <DoctorDashboardCard 
                    title="Subscription & Billing" 
                    icon={<FaDollarSign className="h-8 w-8 text-teal-500"/>} 
                    linkTo="/my-subscription"
                    color="border-teal-500"
                />
            </div>

             <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Links</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Link to="/doctor/profile" className="bg-indigo-100 text-indigo-700 text-center py-3 px-4 rounded-lg hover:bg-indigo-200 transition duration-150 font-medium">Edit My Profile</Link>
                    <Link to="/doctor/availability#leaves" className="bg-red-100 text-red-700 text-center py-3 px-4 rounded-lg hover:bg-red-200 transition duration-150 font-medium">Request Leave</Link>
                    {/* Add more quick links as needed */}
                </div>
            </div>
        </div>
    );
};
export default DoctorDashboardPage;
