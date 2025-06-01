// src/pages/subscriptions/SubscriptionStatusPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { getUserSubscriptionStatus, cancelCurrentSubscription } from '../../services/subscriptionService';
import { useAuth } from '../../hooks/useAuth';
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaSpinner, FaCalendarTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SubscriptionStatusPage = () => {
    const [subscription, setSubscription] = useState(null); // { plan_name, status, ends_at, card_last_four }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const { user } = useAuth();

    const mockSubscription = {
        id: 'sub_123xyz',
        plan: { name: 'Pro Doctor Monthly', price: '79.99', interval: 'month' },
        status: 'active', // active, cancelled, trialing, past_due
        current_period_end: '2024-07-15T00:00:00Z', // Next billing date or end of subscription if cancelled
        cancel_at_period_end: false, // True if cancelled but active until period end
        payment_method_details: { card_brand: 'Visa', card_last_four: '4242' }
    };

    const fetchSubscriptionStatus = useCallback(async () => {
        if (!user) {
            setLoading(false);
            setError("User not authenticated.");
            return;
        }
        setLoading(true);
        // try {
        //     const response = await getUserSubscriptionStatus();
        //     setSubscription(response.data.subscription || response.data); // Adjust based on API
        //     setError(null);
        // } catch (err) {
        //     setError(err.message || 'Failed to fetch subscription status.');
        //     setSubscription(null);
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(() => { // Mock API
            // Simulate different states based on user for testing
            if(user && user.email.includes("no_sub")) {
                 setSubscription(null);
            } else if (user && user.email.includes("cancelled_sub")) {
                setSubscription({...mockSubscription, status: 'active', cancel_at_period_end: true});
            }
            else {
                setSubscription(mockSubscription);
            }
            setLoading(false);
        }, 500);
    }, [user]);

    useEffect(() => {
        fetchSubscriptionStatus();
    }, [fetchSubscriptionStatus]);

    const handleCancelSubscription = async () => {
        if (window.confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.')) {
            setCancelling(true);
            // try {
            //     await cancelCurrentSubscription();
            //     fetchSubscriptionStatus(); // Refresh status
            //     alert('Subscription cancellation request processed.');
            // } catch (err) {
            //     setError(err.response?.data?.message || 'Failed to cancel subscription.');
            // } finally {
            //     setCancelling(false);
            // }
            alert('Mock: Subscription cancellation processed.');
            setSubscription(prev => ({...prev, status: 'active', cancel_at_period_end: true})); // Simulate cancellation
            setCancelling(false);
        }
    };

    if (loading) return <div className="p-6 text-center flex justify-center items-center min-h-[300px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading subscription status...</div>;
    if (error) return <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg shadow">Error: {error}</div>;

    return (
        <div className="py-12 min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-white">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center flex items-center justify-center drop-shadow">
                    <FaCreditCard className="mr-3 text-indigo-600" /> My Subscription
                </h1>

                {!subscription ? (
                    <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl p-10 text-center">
                        <FaTimesCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Active Subscription</h2>
                        <p className="text-gray-500 mb-6">You do not currently have an active subscription plan.</p>
                        <Link
                            to="/subscription-plans"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-150 text-lg"
                        >
                            View Available Plans
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl p-10">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{subscription.plan.name}</h2>
                                <p className="text-gray-500 text-lg">${subscription.plan.price} / {subscription.plan.interval}</p>
                            </div>
                            <span className={`px-4 py-1.5 text-sm font-semibold rounded-full shadow
                                ${
                                    subscription.status === 'active' && !subscription.cancel_at_period_end
                                        ? 'bg-green-100 text-green-800'
                                        : subscription.status === 'active' && subscription.cancel_at_period_end
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`
                            }>
                                {subscription.status === 'active' && subscription.cancel_at_period_end
                                    ? 'Active (Cancels on Period End)'
                                    : subscription.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="space-y-3 text-base text-gray-700">
                            <p>
                                <strong>Status:</strong>{' '}
                                {subscription.status === 'active' && subscription.cancel_at_period_end
                                    ? `Active, will be cancelled on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                                    : subscription.status.replace('_', ' ')}
                            </p>
                            <p>
                                <strong>
                                    {subscription.cancel_at_period_end || subscription.status !== 'active'
                                        ? 'Ends On:'
                                        : 'Next Billing Date:'}
                                </strong>{' '}
                                {new Date(subscription.current_period_end).toLocaleDateString()}
                            </p>
                            {subscription.payment_method_details && (
                                <p>
                                    <strong>Payment Method:</strong> {subscription.payment_method_details.card_brand} ending in **** {subscription.payment_method_details.card_last_four}
                                </p>
                            )}
                        </div>

                        {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                            <div className="mt-10 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={cancelling}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center transition duration-150 text-lg"
                                >
                                    {cancelling ? <FaSpinner className="animate-spin h-5 w-5 mr-2" /> : <FaCalendarTimes className="h-5 w-5 mr-2" />}
                                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Cancellation will take effect at the end of the current billing period.
                                </p>
                            </div>
                        )}
                        {subscription.status === 'active' && subscription.cancel_at_period_end && (
                            <p className="mt-8 p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-base text-center shadow">
                                Your subscription is set to cancel on {new Date(subscription.current_period_end).toLocaleDateString()}. You will retain access until this date.
                            </p>
                        )}
                        {subscription.status !== 'active' && !subscription.cancel_at_period_end && (
                            <Link
                                to="/subscription-plans"
                                className="mt-10 block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-150 text-lg"
                            >
                                Renew or Choose a New Plan
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default SubscriptionStatusPage;