import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarPlus, FaUserMd, FaHistory, FaHeartbeat, FaQuestionCircle } from 'react-icons/fa';

const PatientDashboardCard = ({ title, description, icon, linkTo, linkText, color }) => (
    <Link to={linkTo} className={`block bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 ${color}`}>
        <div className="flex items-start">
            <div className={`p-3 rounded-full mr-4 bg-opacity-20 ${color.replace('border-', 'bg-')}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 mb-3">{description}</p>
                <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    {linkText} &rarr;
                </span>
            </div>
        </div>
    </Link>
);


const PatientDashboardPage = () => {
    // Fetch actual data in a real app
    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Patient Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <PatientDashboardCard 
                    title="Book New Appointment"
                    description="Find a doctor and schedule your next visit."
                    icon={<FaCalendarPlus className="h-8 w-8 text-green-500"/>} 
                    linkTo="/doctors" // Link to doctor search page
                    linkText="Find & Book"
                    color="border-green-500"
                />
                <PatientDashboardCard 
                    title="My Appointments"
                    description="View upcoming and past appointments."
                    icon={<FaHistory className="h-8 w-8 text-blue-500"/>} 
                    linkTo="/patient/appointments"
                    linkText="View History"
                    color="border-blue-500"
                />
                <PatientDashboardCard 
                    title="My Profile"
                    description="Update your personal and health information."
                    icon={<FaUserMd className="h-8 w-8 text-purple-500"/>} 
                    linkTo="/patient/profile"
                    linkText="Edit Profile"
                    color="border-purple-500"
                />
                <PatientDashboardCard 
                    title="Health Records" // Placeholder - if this feature exists
                    description="Access your medical history and documents."
                    icon={<FaHeartbeat className="h-8 w-8 text-red-500"/>} 
                    linkTo="/patient/records" // Create if needed
                    linkText="View Records"
                    color="border-red-500"
                />
                 <PatientDashboardCard 
                    title="Subscription Details"
                    description="Manage your SihaTech subscription plan."
                    icon={<FaQuestionCircle className="h-8 w-8 text-yellow-500"/>} 
                    linkTo="/my-subscription"
                    linkText="My Plan"
                    color="border-yellow-500"
                />
            </div>
        </div>
    );
};
export default PatientDashboardPage;
