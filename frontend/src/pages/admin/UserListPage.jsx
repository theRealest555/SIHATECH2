// src/pages/admin/UserListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, updateUserStatus, deleteUser } from '../../services/adminService'; // Assuming deleteUser will be added
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = useCallback(async (page = 1, search = '') => {
        try {
            setLoading(true);
            // Adjust the params based on your backend API (e.g., page, per_page, search_term)
            const response = await getAllUsers({ page: page, search: search, per_page: 10 }); 
            
            // Assuming backend returns data in a structure like:
            // { data: [users], meta: { current_page, last_page, total } }
            // or { users: [], totalPages: X, currentPage: Y, total: Z }
            // Adjust based on your actual API response structure from adminService.js
            if (response.data && Array.isArray(response.data.data)) { // Laravel pagination default
                setUsers(response.data.data);
                setCurrentPage(response.data.meta.current_page);
                setTotalPages(response.data.meta.last_page);
                setTotalUsers(response.data.meta.total);
            } else if (Array.isArray(response.data)) { // Simpler array response
                 setUsers(response.data);
                 // If no pagination from backend, manage it client-side or assume all data
                 setCurrentPage(1);
                 setTotalPages(1); 
                 setTotalUsers(response.data.length);
            } else {
                // Fallback for unexpected structure
                setUsers(response.data.users || response.data || []);
                setCurrentPage(response.data.currentPage || 1);
                setTotalPages(response.data.totalPages || 1);
                setTotalUsers(response.data.total || (response.data.users || response.data || []).length);

            }
            setError(null);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(currentPage, searchTerm);
    }, [fetchUsers, currentPage, searchTerm]);

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        if (window.confirm(`Are you sure you want to set user ${userId} to ${newStatus}?`)) {
            try {
                await updateUserStatus(userId, newStatus); // API expects an object { status: newStatus }
                // Refetch users to see the change or update locally for better UX
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userId ? { ...user, status: newStatus } : user
                    )
                );
                // fetchUsers(currentPage, searchTerm); // Or refetch
            } catch (err) {
                alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(userId);
                // Refetch users or remove locally
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                // fetchUsers(currentPage, searchTerm); // Or refetch
                 alert('User deleted successfully.');
            } catch (err) {
                alert(`Failed to delete user: ${err.response?.data?.message || err.message}`);
            }
        }
    };
    
    // Client-side filtering if backend doesn't support search or for refinement
    // If backend supports search, this might not be needed or could be supplementary
    const filteredUsers = users; // Assuming backend handles search now
    // const filteredUsers = users.filter(user => 
    //     `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     user.role.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };
    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers(1, searchTerm); // Fetch with current search term from page 1
    };

    const Pagination = () => {
        if (totalPages <= 1) return null;
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    disabled={loading || i === currentPage}
                    className={`px-3 py-1 mx-1 rounded-md text-sm font-medium
                        ${i === currentPage ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="mt-6 flex justify-center items-center">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={loading || currentPage === 1}
                    className="px-3 py-1 mx-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                    Previous
                </button>
                {pages}
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={loading || currentPage === totalPages}
                    className="px-3 py-1 mx-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                    Next
                </button>
                 <span className="ml-4 text-sm text-gray-600">Page {currentPage} of {totalPages} (Total: {totalUsers} users)</span>
            </div>
        );
    };


    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <Link 
                    to="/admin/users/create" // You'll need a create user page/route
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center self-start md:self-center"
                >
                    <FaPlus className="mr-2" /> Add New User
                </Link>
            </div>

            <form onSubmit={handleSearchSubmit} className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="relative flex items-center">
                    <input 
                        type="text"
                        placeholder="Search users (name, email, role)..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-3 pl-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <button 
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-r-lg transition duration-150"
                        disabled={loading}
                    >
                        Search
                    </button>
                </div>
            </form>

            {loading && (
                 <div className="flex justify-center items-center p-10">
                    <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
                    <span className="ml-3 text-gray-700">Loading users...</span>
                </div>
            )}
            {error && !loading && <div className="p-6 text-center text-red-600 bg-red-100 rounded-lg shadow">Error: {error}</div>}
            
            {!loading && !error && (
                <>
                    <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleToggleStatus(user.id, user.status)} className={`p-1 rounded-full hover:bg-opacity-80 ${user.status === 'active' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`} title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                                                {user.status === 'active' ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                                            </button>
                                            <Link to={`/admin/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-900 p-1" title="Edit User">
                                                <FaEdit size={18}/>
                                            </Link>
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 p-1" title="Delete User">
                                                <FaTrash size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination />
                </>
            )}
        </div>
    );
};
export default UserListPage;