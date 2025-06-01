// src/pages/admin/LanguageManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { getAllLanguages, createLanguage, updateLanguage, deleteLanguage } from '../../services/adminService';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaLanguage as LanguageIcon } from 'react-icons/fa';

const LanguageManagementPage = () => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState({ id: null, name: '', code: '' });
    const [modalMode, setModalMode] = useState('add');

    const mockLanguages = [
        { id: 1, name: 'English', code: 'en' },
        { id: 2, name: 'French', code: 'fr' },
        { id: 3, name: 'Arabic', code: 'ar' },
    ];

    const fetchLanguages = useCallback(async () => {
        setLoading(true);
        // try {
        //     const response = await getAllLanguages();
        //     setLanguages(response.data.languages || response.data || []);
        //     setError(null);
        // } catch (err) {
        //     setError(err.message || 'Failed to fetch languages.');
        //     setLanguages([]);
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(() => { // Mock API
            setLanguages(mockLanguages);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        fetchLanguages();
    }, [fetchLanguages]);

    const openModal = (mode, language = null) => {
        setModalMode(mode);
        setCurrentLanguage(language ? { ...language } : { id: null, name: '', code: '' });
        setIsModalOpen(true);
        setError(null);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentLanguage(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // try {
        //     if (modalMode === 'edit' && currentLanguage.id) {
        //         await updateLanguage(currentLanguage.id, currentLanguage);
        //     } else {
        //         await createLanguage(currentLanguage);
        //     }
        //     fetchLanguages();
        //     closeModal();
        // } catch (err) {
        //     setError(err.response?.data?.message || `Failed to ${modalMode} language.`);
        // } finally {
        //     setLoading(false);
        // }
        alert(`Mock ${modalMode} language: ${currentLanguage.name}`);
        setLoading(false);
        if(modalMode === 'add') setLanguages(prev => [...prev, {...currentLanguage, id: Date.now()}]);
        else setLanguages(prev => prev.map(s => s.id === currentLanguage.id ? currentLanguage : s));
        closeModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this language?')) {
            setLoading(true);
            // try {
            //     await deleteLanguage(id);
            //     fetchLanguages();
            // } catch (err) {
            //     setError(err.response?.data?.message || 'Failed to delete language.');
            // } finally {
            //     setLoading(false);
            // }
            alert(`Mock delete language ID: ${id}`);
            setLanguages(prev => prev.filter(s => s.id !== id));
            setLoading(false);
        }
    };

    if (loading && languages.length === 0) return <div className="p-6 text-center flex justify-center items-center min-h-[200px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading languages...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><LanguageIcon className="mr-3 text-indigo-600"/>Language Management</h1>
                <button onClick={() => openModal('add')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center">
                    <FaPlus className="mr-2"/> Add Language
                </button>
            </div>
             {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md shadow">{error}</div>}

            <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {languages.length > 0 ? languages.map(lang => (
                            <tr key={lang.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lang.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lang.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => openModal('edit', lang)} className="text-indigo-600 hover:text-indigo-900 p-1" title="Edit"><FaEdit size={18}/></button>
                                    <button onClick={() => handleDelete(lang.id)} className="text-red-600 hover:text-red-900 p-1" title="Delete"><FaTrash size={16}/></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500">No languages found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

             {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{modalMode === 'edit' ? 'Edit' : 'Add New'} Language</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Language Name</label>
                                <input type="text" name="name" id="name" value={currentLanguage.name} onChange={handleInputChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Language Code (e.g., en, fr)</label>
                                <input type="text" name="code" id="code" value={currentLanguage.code} onChange={handleInputChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
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
export default LanguageManagementPage;