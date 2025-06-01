// src/pages/doctor/StatisticsPage.jsx
import React from 'react';
import { FaChartLine, FaUsers, FaCalendarCheck, FaDollarSign } from 'react-icons/fa';
// Placeholder for a chart library if you use one, e.g., Chart.js, Recharts
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DoctorStatisticsPage = () => {
    // Mock data, fetch from API in real app
    const statsData = {
        totalAppointments: 152,
        uniquePatients: 85,
        avgRating: 4.7,
        monthlyEarnings: 3250, // Example
        appointmentsByMonth: [
            { name: 'Jan', count: 20 }, { name: 'Feb', count: 25 }, { name: 'Mar', count: 30 },
            { name: 'Apr', count: 28 }, { name: 'May', count: 35 }, { name: 'Jun', count: 14 }
        ]
    };

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center"><FaChartLine className="mr-3 text-indigo-600"/>My Performance Statistics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Appointments" value={statsData.totalAppointments} icon={<FaCalendarCheck className="text-blue-500"/>} />
                <StatCard title="Unique Patients Seen" value={statsData.uniquePatients} icon={<FaUsers className="text-green-500"/>} />
                <StatCard title="Average Rating" value={`${statsData.avgRating} / 5`} icon={<FaChartLine className="text-yellow-500"/>} />
                <StatCard title="Monthly Earnings (Est.)" value={`$${statsData.monthlyEarnings}`} icon={<FaDollarSign className="text-purple-500"/>} />
            </div>

            <div className="bg-white shadow-xl rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Appointments Trend (Last 6 Months)</h2>
                <div className="h-80 text-center flex items-center justify-center bg-gray-50 rounded-md border">
                    {/* // Example with Recharts:
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={statsData.appointmentsByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Appointments"/>
                        </LineChart>
                    </ResponsiveContainer> 
                    */}
                     <p className="text-gray-500">Chart placeholder: A line chart showing appointments over time would be displayed here.</p>
                </div>
            </div>
            {/* Add more sections for other stats like patient demographics, popular services, etc. */}
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow">
        <div className="p-3 bg-indigo-100 rounded-full">
            {React.cloneElement(icon, { className: `${icon.props.className} h-7 w-7` })}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);

export default DoctorStatisticsPage;

