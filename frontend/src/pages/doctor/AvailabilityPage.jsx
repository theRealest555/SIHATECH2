// src/pages/doctor/AvailabilityPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// import { getDoctorAvailability, updateDoctorAvailability, createLeave, deleteLeave } from '../../services/doctorService';
import { FaCalendarAlt, FaPlus, FaTrash, FaSpinner, FaMoon } from 'react-icons/fa';

const AvailabilityPage = () => {
    const [availabilities, setAvailabilities] = useState([]); // [{ day_of_week: 'Monday', start_time: '09:00', end_time: '17:00' }]
    const [leaves, setLeaves] = useState([]); // [{ start_date: 'YYYY-MM-DD', end_date: 'YYYY-MM-DD', reason: 'Vacation' }]
    const [loading, setLoading] = useState({ schedule: true, leaves: true });
    const [error, setError] = useState(null);
    
    // Form states
    const [newSlot, setNewSlot] = useState({ day_of_week: 'Monday', start_time: '09:00', end_time: '17:00' });
    const [newLeave, setNewLeave] = useState({ start_date: '', end_date: '', reason: '' });

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Mock data
    const mockAvailabilities = [
        { id: 1, day_of_week: 'Monday', start_time: '09:00', end_time: '17:00' },
        { id: 2, day_of_week: 'Wednesday', start_time: '10:00', end_time: '18:00' },
        { id: 3, day_of_week: 'Friday', start_time: '09:00', end_time: '13:00' },
    ];
    const mockLeaves = [
        { id: 1, start_date: '2024-07-01', end_date: '2024-07-05', reason: 'Vacation' },
    ];

    const fetchAvailability = useCallback(async () => {
        // setLoading(prev => ({...prev, schedule: true}));
        // try {
        //     const response = await getDoctorAvailability(); // This should fetch recurring weekly schedule
        //     setAvailabilities(response.data.availability || []);
        // } catch (err) { setError(err.message); } 
        // finally { setLoading(prev => ({...prev, schedule: false})); }
        setTimeout(() => {
            setAvailabilities(mockAvailabilities);
            setLoading(prev => ({...prev, schedule: false}));
        }, 500);
    }, []);

    const fetchLeaves = useCallback(async () => {
        // setLoading(prev => ({...prev, leaves: true}));
        // try {
        //     const response = await getDoctorLeaves(); // Assuming an endpoint for leaves
        //     setLeaves(response.data.leaves || []);
        // } catch (err) { setError(err.message); }
        // finally { setLoading(prev => ({...prev, leaves: false})); }
         setTimeout(() => {
            setLeaves(mockLeaves);
            setLoading(prev => ({...prev, leaves: false}));
        }, 500);
    }, []);


    useEffect(() => {
        fetchAvailability();
        fetchLeaves();
    }, [fetchAvailability, fetchLeaves]);

    const handleSlotChange = (e) => setNewSlot({...newSlot, [e.target.name]: e.target.value });
    const handleLeaveChange = (e) => setNewLeave({...newLeave, [e.target.name]: e.target.value });

    const handleAddSlot = async (e) => {
        e.preventDefault();
        // setLoading(prev => ({...prev, schedule: true}));
        // try {
        //     await updateDoctorAvailability([...availabilities, newSlot]); // Backend might take array or single slot
        //     fetchAvailability();
        //     setNewSlot({ day_of_week: 'Monday', start_time: '09:00', end_time: '17:00' });
        // } catch (err) { setError(err.message); setLoading(prev => ({...prev, schedule: false}));}
        alert(`Mock add slot: ${newSlot.day_of_week} ${newSlot.start_time}-${newSlot.end_time}`);
        setAvailabilities(prev => [...prev, {...newSlot, id: Date.now()}]);
    };
    
    const handleDeleteSlot = async (slotId) => {
        // const updatedAvailability = availabilities.filter(slot => slot.id !== slotId);
        // try {
        //    await updateDoctorAvailability(updatedAvailability); // Send the whole updated schedule
        //    fetchAvailability();
        // } catch (err) { setError(err.message); }
        alert(`Mock delete slot ID: ${slotId}`);
        setAvailabilities(prev => prev.filter(s => s.id !== slotId));
    };

    const handleAddLeave = async (e) => {
        e.preventDefault();
        // setLoading(prev => ({...prev, leaves: true}));
        // try {
        //     await createLeave(newLeave);
        //     fetchLeaves();
        //     setNewLeave({ start_date: '', end_date: '', reason: '' });
        // } catch (err) { setError(err.message); setLoading(prev => ({...prev, leaves: false}));}
        alert(`Mock add leave: ${newLeave.start_date} to ${newLeave.end_date}`);
        setLeaves(prev => [...prev, {...newLeave, id: Date.now()}]);
    };
    
    const handleDeleteLeave = async (leaveId) => {
        // try {
        //    await deleteLeave(leaveId);
        //    fetchLeaves();
        // } catch (err) { setError(err.message); }
        alert(`Mock delete leave ID: ${leaveId}`);
        setLeaves(prev => prev.filter(l => l.id !== leaveId));
    };


    return (
        <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-white">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 drop-shadow">Manage Availability & Leaves</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            {/* Weekly Schedule Section */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FaCalendarAlt className="mr-2 text-indigo-600"/>Weekly Schedule
                </h2>
                <form onSubmit={handleAddSlot} className="bg-white p-6 rounded-2xl shadow-2xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-gray-100">
                    <div>
                        <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700">Day</label>
                        <select name="day_of_week" value={newSlot.day_of_week} onChange={handleSlotChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input type="time" name="start_time" value={newSlot.start_time} onChange={handleSlotChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time</label>
                        <input type="time" name="end_time" value={newSlot.end_time} onChange={handleSlotChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center justify-center h-10 transition-all duration-200">
                        <FaPlus className="mr-2"/> Add Slot
                    </button>
                </form>
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
                    {loading.schedule ? <FaSpinner className="animate-spin h-6 w-6 text-indigo-500 mx-auto"/> : (
                        availabilities.length > 0 ? (
                            <ul className="space-y-3">
                                {availabilities.map(slot => (
                                    <li key={slot.id} className="flex justify-between items-center p-3 bg-indigo-50 rounded-md border hover:shadow transition-shadow">
                                        <span className="font-medium text-gray-700">{slot.day_of_week}: {slot.start_time} - {slot.end_time}</span>
                                        <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-500 hover:text-red-700"><FaTrash/></button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-600 text-center">No availability slots defined yet.</p>
                    )}
                </div>
            </section>

            {/* Leaves Section */}
            <section id="leaves">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FaMoon className="mr-2 text-indigo-600"/>Manage Leaves
                </h2>
                <form onSubmit={handleAddLeave} className="bg-white p-6 rounded-2xl shadow-2xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-gray-100">
                    <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" name="start_date" value={newLeave.start_date} onChange={handleLeaveChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" name="end_date" value={newLeave.end_date} onChange={handleLeaveChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                        <input type="text" name="reason" value={newLeave.reason} onChange={handleLeaveChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Vacation"/>
                    </div>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center justify-center h-10 transition-all duration-200">
                        <FaPlus className="mr-2"/> Add Leave
                    </button>
                </form>
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
                    {loading.leaves ? <FaSpinner className="animate-spin h-6 w-6 text-indigo-500 mx-auto"/> : (
                        leaves.length > 0 ? (
                            <ul className="space-y-3">
                                {leaves.map(leave => (
                                    <li key={leave.id} className="flex justify-between items-center p-3 bg-red-50 rounded-md border border-red-200 hover:shadow transition-shadow">
                                        <div>
                                            <span className="font-medium text-gray-700">From: {new Date(leave.start_date).toLocaleDateString()} To: {new Date(leave.end_date).toLocaleDateString()}</span>
                                            {leave.reason && <span className="text-sm text-gray-600 italic ml-2">({leave.reason})</span>}
                                        </div>
                                        <button onClick={() => handleDeleteLeave(leave.id)} className="text-red-500 hover:text-red-700"><FaTrash/></button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-600 text-center">No leaves scheduled.</p>
                    )}
                </div>
            </section>
        </div>
    );
};
export default AvailabilityPage;