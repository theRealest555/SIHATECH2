// src/pages/admin/AuditLogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { getAuditLogs } from '../../services/adminService';
import { FaUserCircle, FaCalendarAlt, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ userId: '', actionType: '', startDate: '', endDate: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Mock data for now
    const mockLogs = [
        { id: 1, user: { id: 101, name: 'Admin User' }, action: 'User Login', description: 'Admin User logged in from IP 192.168.1.10', ip_address: '192.168.1.10', created_at: '2024-05-28T10:30:00Z' },
        { id: 2, user: { id: 205, name: 'Dr. Smith' }, action: 'Profile Update', description: 'Dr. Smith updated their consultation fee.', ip_address: '203.0.113.45', created_at: '2024-05-28T11:15:00Z' },
        { id: 3, user: null, action: 'System Maintenance', description: 'Scheduled maintenance task initiated.', ip_address: 'SYSTEM', created_at: '2024-05-27T23:00:00Z' },
        { id: 4, user: { id: 310, name: 'Patient Alice' }, action: 'Appointment Cancelled', description: 'Patient Alice cancelled appointment #APP123.', ip_address: '198.51.100.2', created_at: '2024-05-28T09:00:00Z' },
    ];

    const fetchAuditLogs = useCallback(async (page = 1, appliedFilters = {}) => {
        setLoading(true);
        // try {
        //     const params = { page, ...appliedFilters };
        //     const response = await getAuditLogs(params);
        //     // Assuming response.data.data for logs and response.data.meta for pagination
        //     setLogs(response.data.data || []);
        //     setCurrentPage(response.data.meta.current_page);
        //     setTotalPages(response.data.meta.last_page);
        //     setError(null);
        // } catch (err) {
        //     console.error("Error fetching audit logs:", err);
        //     setError(err.response?.data?.message || err.message || 'Failed to fetch audit logs.');
        //     setLogs([]);
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(() => { // Mock API call
            setLoading(false);
            setLogs(mockLogs.filter(log => 
                (appliedFilters.userId ? log.user?.id.toString() === appliedFilters.userId : true) &&
                (appliedFilters.actionType ? log.action.toLowerCase().includes(appliedFilters.actionType.toLowerCase()) : true)
            ));
            setCurrentPage(page);
            setTotalPages(1); // Mock total pages
        }, 1000);
    }, []);

    useEffect(() => {
        fetchAuditLogs(currentPage, filters);
    }, [fetchAuditLogs, currentPage, filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new filter
        fetchAuditLogs(1, filters);
    };
    
    const LogItem = ({ log }) => (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(log.created_at).toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    {log.user ? (
                        <>
                            <FaUserCircle className="h-6 w-6 text-gray-400 mr-2"/>
                            <div>
                                <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                                <div className="text-xs text-gray-500">ID: {log.user.id}</div>
                            </div>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500 italic">System</span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{log.action}</td>
            <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={log.description}>{log.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip_address}</td>
        </tr>
    );


    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Audit Logs</h1>

            <form onSubmit={handleFilterSubmit} className="bg-white shadow-xl rounded-lg p-6 mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
                        <input type="text" name="userId" id="userId" value={filters.userId} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 101"/>
                    </div>
                    <div>
                        <label htmlFor="actionType" className="block text-sm font-medium text-gray-700">Action Type</label>
                        <input type="text" name="actionType" id="actionType" value={filters.actionType} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Login, Update"/>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md flex items-center justify-center min-w-[120px]" disabled={loading}>
                        {loading ? <FaSpinner className="animate-spin h-5 w-5 mr-2"/> : <FaFilter className="h-5 w-5 mr-2"/>}
                        {loading ? 'Filtering...' : 'Filter Logs'}
                    </button>
                </div>
            </form>
            
            {loading && <div className="p-6 text-center flex justify-center items-center min-h-[200px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading audit logs...</div>}
            {error && !loading && <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg shadow">Error: {error}</div>}

            {!loading && !error && (
                <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.length > 0 ? logs.map(log => <LogItem key={log.id} log={log} />) : (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No audit logs found matching your criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                    {/* Add Pagination component if API supports it */}
                </div>
            )}
        </div>
    );
};
export default AuditLogPage;