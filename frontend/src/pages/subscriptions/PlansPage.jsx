// src/pages/subscriptions/PlansPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { getSubscriptionPlans, subscribeToPlan } from '../../services/subscriptionService';
import { useAuth } from '../../hooks/useAuth';
import { FaCheckCircle, FaPaperPlane, FaSpinner, FaCreditCard } from 'react-icons/fa';

const SubscriptionPlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscribingPlanId, setSubscribingPlanId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const mockPlans = [
        { id: 'plan_basic_monthly', name: 'Basic Doctor Monthly', price: '29.99', currency: 'USD', interval: 'month', description: 'Ideal for individual practitioners starting out.', features: ['Public Profile Listing', 'Basic Appointment Scheduling', 'Email Support'] },
        { id: 'plan_pro_monthly', name: 'Pro Doctor Monthly', price: '79.99', currency: 'USD', interval: 'month', description: 'For established doctors needing more tools.', features: ['Enhanced Profile', 'Advanced Scheduling', 'Patient Analytics', 'Priority Support', 'Document Uploads (5GB)'] },
        { id: 'plan_clinic_monthly', name: 'Clinic Monthly', price: '199.99', currency: 'USD', interval: 'month', description: 'Manage multiple doctors and staff.', features: ['Up to 5 Doctor Profiles', 'Clinic Admin Panel', 'Shared Scheduling Tools', 'Team Collaboration', 'Custom Branding Options'] },
    ];

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        // try {
        //     const response = await getSubscriptionPlans();
        //     setPlans(response.data.plans || []); // Adjust based on API
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

    const handleSubscribe = async (planId) => {
        if (!user) {
            navigate('/login', { state: { from: '/subscription-plans', message: 'Please login to subscribe.' } });
            return;
        }
        if (user.role !== 'doctor' && user.role !== 'admin') { // Assuming admins can also subscribe for clinics
             alert("Subscription plans are currently available for doctors and clinics.");
             return;
        }
        setSubscribingPlanId(planId);
        // try {
        //     // Here you might integrate Stripe Elements for payment method collection
        //     // For simplicity, assuming planId is enough for backend to initiate Stripe Checkout or similar
        //     const response = await subscribeToPlan({ plan_id: planId /*, payment_method_id: 'pm_xxx' */ });
        //     // Handle response, e.g., redirect to Stripe Checkout, or show success
        //     if (response.data.requires_action) {
        //         // Handle 3D Secure or other actions
        //     } else if (response.data.success) {
        //         alert('Subscription successful!');
        //         navigate('/my-subscription'); // Or doctor dashboard
        //     }
        // } catch (err) {
        //     setError(err.response?.data?.message || `Failed to subscribe to plan.`);
        // } finally {
        //     setSubscribingPlanId(null);
        // }
        alert(`Mock subscribing to plan ID: ${planId}. You would be redirected to payment.`);
        setTimeout(() => {
            setSubscribingPlanId(null);
            navigate('/my-subscription');
        }, 1500);
    };
    
    if (loading) return <div className="p-6 text-center flex justify-center items-center min-h-[300px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading plans...</div>;
    if (error) return <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg shadow">Error: {error}</div>;

    return (
        <div className="py-12 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <FaCreditCard className="mx-auto h-16 w-16 text-indigo-600 mb-4"/>
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Our Subscription Plans</h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Choose the perfect plan to enhance your medical practice and connect with more patients.</p>
                </div>

                {plans.length === 0 && !loading && (
                    <p className="text-center text-gray-500 text-lg">No subscription plans available at the moment. Please check back later.</p>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-white rounded-2xl shadow-xl p-8 flex flex-col ${plan.name.toLowerCase().includes('pro') ? 'border-4 border-indigo-500 relative' : 'border border-gray-200'}`}>
                            {plan.name.toLowerCase().includes('pro') && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1 text-sm font-semibold text-white bg-indigo-500 rounded-full shadow-md">Most Popular</span>
                                </div>
                            )}
                            <div className="flex-grow">
                                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                                <p className="mt-4 flex items-baseline text-gray-900">
                                    <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                                    <span className="ml-1 text-xl font-semibold text-gray-500">/{plan.interval}</span>
                                </p>
                                <p className="mt-3 text-sm text-gray-500">{plan.description}</p>
                                <ul role="list" className="mt-6 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex space-x-3">
                                            <FaCheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={subscribingPlanId === plan.id}
                                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-lg text-center font-medium transition-colors duration-150
                                    ${plan.name.toLowerCase().includes('pro') ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}
                                    ${subscribingPlanId === plan.id ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                {subscribingPlanId === plan.id ? (
                                    <FaSpinner className="animate-spin inline mr-2"/>
                                ) : (
                                    <FaPaperPlane className="inline mr-2"/>
                                )}
                                {subscribingPlanId === plan.id ? 'Processing...' : 'Choose Plan'}
                            </button>
                        </div>
                    ))}
                </div>
                 {!user && (
                    <p className="mt-10 text-center text-md text-gray-600">
                        Already have an account? <Link to="/login" state={{ from: '/subscription-plans' }} className="font-medium text-indigo-600 hover:text-indigo-500">Login</Link> to subscribe.
                    </p>
                )}
            </div>
        </div>
    );
};
export default SubscriptionPlansPage;