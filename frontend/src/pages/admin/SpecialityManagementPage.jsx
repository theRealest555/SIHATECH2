// src/pages/admin/SpecialityManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { getAllSpecialities, createSpeciality, updateSpeciality, deleteSpeciality } from '../../services/adminService';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTag } from 'react-icons/fa';

const SpecialityManagementPage = () => {
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSpeciality, setCurrentSpeciality] = useState({ id: null, name: '', description: '' });
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

    const mockSpecialities = [
        { id: 1, name: 'Cardiology', description: 'Deals with heart disorders.' },
        { id: 2, name: 'Dermatology', description: 'Manages skin diseases.' },
        { id: 3, name: 'Neurology', description: 'Focuses on nervous system disorders.' },
    ];

    const fetchSpecialities = useCallback(async () => {
        setLoading(true);
        // try {
        //     const response = await getAllSpecialities();
        //     setSpecialities(response.data.specialities || response.data || []);
        //     setError(null);
        // } catch (err) {
        //     setError(err.message || 'Failed to fetch specialities.');
        //     setSpecialities([]);
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(() => { // Mock API
            setSpecialities(mockSpecialities);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        fetchSpecialities();
    }, [fetchSpecialities]);

    const openModal = (mode, speciality = null) => {
        setModalMode(mode);
        setCurrentSpeciality(speciality ? { ...speciality } : { id: null, name: '', description: '' });
        setIsModalOpen(true);
        setError(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentSpeciality({ id: null, name: '', description: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSpeciality(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // try {
        //     if (modalMode === 'edit' && currentSpeciality.id) {
        //         await updateSpeciality(currentSpeciality.id, currentSpeciality);
        //     } else {
        //         await createSpeciality(currentSpeciality);
        //     }
        //     fetchSpecialities(); // Refresh list
        //     closeModal();
        // } catch (err) {
        //     setError(err.response?.data?.message || `Failed to ${modalMode} speciality.`);
        // } finally {
        //     setLoading(false);
        // }
        alert(`Mock ${modalMode} speciality: ${currentSpeciality.name}`);
        setLoading(false);
        // Simulate success for mock
        if(modalMode === 'add') setSpecialities(prev => [...prev, {...currentSpeciality, id: Date.now()}]);
        else setSpecialities(prev => prev.map(s => s.id === currentSpeciality.id ? currentSpeciality : s));
        closeModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this speciality?')) {
            setLoading(true);
            // try {
            //     await deleteSpeciality(id);
            //     fetchSpecialities();
            // } catch (err) {
            //     setError(err.response?.data?.message || 'Failed to delete speciality.');
            // } finally {
            //     setLoading(false);
            // }
            alert(`Mock delete speciality ID: ${id}`);
            setSpecialities(prev => prev.filter(s => s.id !== id));
            setLoading(false);
        }
    };
    
    if (loading && specialities.length === 0) return <div className="p-6 text-center flex justify-center items-center min-h-[200px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading specialities...</div>;


    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FaTag className="mr-3 text-indigo-600"/>Speciality Management</h1>
                <button onClick={() => openModal('add')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center">
                    <FaPlus className="mr-2"/> Add Speciality
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md shadow">{error}</div>}
            
            <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {specialities.length > 0 ? specialities.map(spec => (
                            <tr key={spec.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{spec.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-lg truncate" title={spec.description}>{spec.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => openModal('edit', spec)} className="text-indigo-600 hover:text-indigo-900 p-1" title="Edit">
                                        <FaEdit size={18}/>
                                    </button>
                                    <button onClick={() => handleDelete(spec.id)} className="text-red-600 hover:text-red-900 p-1" title="Delete">
                                        <FaTrash size={16}/>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                             <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500">No specialities found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{modalMode === 'edit' ? 'Edit' : 'Add New'} Speciality</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" name="name" id="name" value={currentSpeciality.name} onChange={handleInputChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea name="description" id="description" value={currentSpeciality.description} onChange={handleInputChange} rows="3" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center min-w-[100px]">
                                    {loading ? <FaSpinner className="animate-spin"/> : (modalMode === 'edit' ? 'Save' : 'Add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SpecialityManagementPage;