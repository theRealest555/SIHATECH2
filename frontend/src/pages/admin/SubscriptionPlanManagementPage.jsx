// src/pages/admin/SubscriptionPlanManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { getAllSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '../../services/adminService';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaCreditCard } from 'react-icons/fa';

const SubscriptionPlanManagementPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState({ id: null, name: '', price: '', duration_months: '', features: '' });
    const [modalMode, setModalMode] = useState('add');

    const mockPlans = [
        { id: 1, name: 'Basic Doctor', price: '29.99', duration_months: 1, features: 'Profile Listing, Basic Scheduling' },
        { id: 2, name: 'Pro Doctor', price: '79.99', duration_months: 1, features: 'Profile Listing, Advanced Scheduling, Analytics, Priority Support' },
        { id: 3, name: 'Clinic Basic', price: '149.99', duration_months: 1, features: 'Up to 5 Doctors, Clinic Profile, Shared Scheduling' },
    ];

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        // try {
        //     const response = await getAllSubscriptionPlans();
        //     setPlans(response.data.plans || response.data || []);
        //     setError(null);
        // } catch (err) {
        //     setError(err.message || 'Failed to fetch subscription plans.');
        //     setPlans([]);
        // } finally {
        //     setLoading(false);
        // }
         setTimeout(() => { // Mock API
            setPlans(mockPlans);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const openModal = (mode, plan = null) => {
        setModalMode(mode);
        setCurrentPlan(plan ? { ...plan, features: Array.isArray(plan.features) ? plan.features.join(', ') : plan.features } : { id: null, name: '', price: '', duration_months: '', features: '' });
        setIsModalOpen(true);
        setError(null);
    };
    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPlan(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const planDataToSubmit = {
            ...currentPlan,
            features: currentPlan.features.split(',').map(f => f.trim()).filter(f => f) // Convert comma-separated string to array
        };
        // try {
        //     if (modalMode === 'edit' && planDataToSubmit.id) {
        //         await updateSubscriptionPlan(planDataToSubmit.id, planDataToSubmit);
        //     } else {
        //         await createSubscriptionPlan(planDataToSubmit);
        //     }
        //     fetchPlans();
        //     closeModal();
        // } catch (err) {
        //     setError(err.response?.data?.message || `Failed to ${modalMode} plan.`);
        // } finally {
        //     setLoading(false);
        // }
        alert(`Mock ${modalMode} plan: ${planDataToSubmit.name}`);
        setLoading(false);
        if(modalMode === 'add') setPlans(prev => [...prev, {...planDataToSubmit, id: Date.now()}]);
        else setPlans(prev => prev.map(s => s.id === planDataToSubmit.id ? planDataToSubmit : s));
        closeModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            setLoading(true);
            // try {
            //     await deleteSubscriptionPlan(id);
            //     fetchPlans();
            // } catch (err) {
            //     setError(err.response?.data?.message || 'Failed to delete plan.');
            // } finally {
            //     setLoading(false);
            // }
            alert(`Mock delete plan ID: ${id}`);
            setPlans(prev => prev.filter(s => s.id !== id));
            setLoading(false);
        }
    };

    if (loading && plans.length === 0) return <div className="p-6 text-center flex justify-center items-center min-h-[200px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading plans...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FaCreditCard className="mr-3 text-indigo-600"/>Subscription Plan Management</h1>
                <button onClick={() => openModal('add')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center">
                    <FaPlus className="mr-2"/> Add Plan
                </button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md shadow">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.length > 0 ? plans.map(plan => (
                    <div key={plan.id} className="bg-white shadow-xl rounded-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow">
                        <div>
                            <h3 className="text-xl font-semibold text-indigo-700 mb-2">{plan.name}</h3>
                            <p className="text-3xl font-bold text-gray-800 mb-1">${plan.price} <span className="text-sm font-normal text-gray-500">/ {plan.duration_months} month(s)</span></p>
                            <p className="text-sm text-gray-600 mb-3">Duration: {plan.duration_months} month(s)</p>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Features:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                                {(Array.isArray(plan.features) ? plan.features : plan.features.split(',')).map((feature, index) => (
                                    <li key={index}>{feature.trim()}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-auto flex justify-end space-x-2 pt-4 border-t border-gray-200">
                            <button onClick={() => openModal('edit', plan)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-100" title="Edit"><FaEdit size={18}/></button>
                            <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-100" title="Delete"><FaTrash size={16}/></button>
                        </div>
                    </div>
                )) : (
                     <p className="col-span-full text-center text-gray-500 py-10">No subscription plans found.</p>
                )}
            </div>

             {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{modalMode === 'edit' ? 'Edit' : 'Add New'} Subscription Plan</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Plan Name</label>
                                <input type="text" name="name" id="name" value={currentPlan.name} onChange={handleInputChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (USD)</label>
                                    <input type="number" name="price" id="price" step="0.01" value={currentPlan.price} onChange={handleInputChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                                </div>
                                <div>
                                    <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700">Duration (Months)</label>
                                    <input type="number" name="duration_months" id="duration_months" min="1" value={currentPlan.duration_months} onChange={handleInputChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="features" className="block text-sm font-medium text-gray-700">Features (comma-separated)</label>
                                <textarea name="features" id="features" value={currentPlan.features} onChange={handleInputChange} rows="3" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Feature 1, Feature 2, Another Feature"></textarea>
                            </div>
                             {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg">Cancel</button>
                                <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center min-w-[100px]">
                                    {loading ? <FaSpinner className="animate-spin"/> : (modalMode === 'edit' ? 'Save Plan' : 'Add Plan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SubscriptionPlanManagementPage;