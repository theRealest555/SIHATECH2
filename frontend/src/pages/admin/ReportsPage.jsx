// src/pages/admin/ReportsPage.jsx
import React, { useState } from 'react';
import { FaFilePdf, FaFileExcel, FaChartBar, FaCalendarAlt, FaFilter, FaSpinner } from 'react-icons/fa';
// import { getFinancialReport, getUserActivityReport, getDoctorPerformanceReport } from '../../services/adminService';

const ReportsPage = () => {
    const [reportType, setReportType] = useState('financial');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null); // To store fetched report data
    const [error, setError] = useState(null);

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setReportData(null);
        // try {
        //     let response;
        //     const params = { start_date: dateRange.start, end_date: dateRange.end };
        //     switch (reportType) {
        //         case 'financial':
        //             response = await getFinancialReport(params);
        //             break;
        //         case 'user_activity':
        //             response = await getUserActivityReport(params);
        //             break;
        //         case 'doctor_performance':
        //             response = await getDoctorPerformanceReport(params);
        //             break;
        //         default:
        //             throw new Error('Invalid report type');
        //     }
        //     setReportData(response.data); // Adjust based on actual API response
        //     alert('Report generated successfully! (Data in console/state)');
        //     console.log("Report Data:", response.data);
        // } catch (err) {
        //     console.error("Error generating report:", err);
        //     setError(err.response?.data?.message || err.message || 'Failed to generate report.');
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(() => { // Mock API call
            setLoading(false);
            setReportData({
                title: `${reportType.replace('_', ' ')} Report (${dateRange.start} to ${dateRange.end || 'Today'})`,
                summary: `This is a mock ${reportType.replace('_', ' ')} report.`,
                details: [
                    { metric: 'Total Revenue', value: '$10,500', period: 'This Month' },
                    { metric: 'New Users', value: '150', period: 'This Month' },
                    { metric: 'Appointments Booked', value: '780', period: 'This Month' },
                ]
            });
            alert('Mock report generated!');
        }, 1500);
    };

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">System Reports</h1>

            <form onSubmit={handleGenerateReport} className="bg-white shadow-xl rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select 
                            id="reportType" 
                            value={reportType} 
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="financial">Financial Report</option>
                            <option value="user_activity">User Activity</option>
                            <option value="doctor_performance">Doctor Performance</option>
                            {/* Add more report types as needed */}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input 
                            type="date" 
                            id="startDate" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input 
                            type="date" 
                            id="endDate" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center min-w-[150px]"
                    >
                        {loading ? <FaSpinner className="animate-spin h-5 w-5 mr-2" /> : <FaChartBar className="h-5 w-5 mr-2" />}
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </form>

            {error && <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg shadow mb-6">Error: {error}</div>}

            {reportData && !loading && (
                <div className="bg-white shadow-xl rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{reportData.title}</h2>
                    <p className="text-gray-700 mb-4">{reportData.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {reportData.details?.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-700">{item.metric}</h3>
                                <p className="text-2xl font-bold text-indigo-600">{item.value}</p>
                                <p className="text-xs text-gray-500">{item.period}</p>
                            </div>
                        ))}
                    </div>
                    {/* Placeholder for charts or detailed tables */}
                    <div className="text-center text-gray-500 py-8 border-t border-gray-200">
                        <FaChartBar className="h-16 w-16 mx-auto text-gray-300 mb-2" />
                        Detailed chart or data table would appear here.
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors">
                            <FaFileExcel className="mr-2"/> Export Excel
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors">
                            <FaFilePdf className="mr-2"/> Export PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ReportsPage;