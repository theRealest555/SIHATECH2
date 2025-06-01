// src/pages/patient/AppointmentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import { getPatientAppointments, cancelAppointment } from '../../services/patientService';
import { FaCalendarAlt, FaUserMd, FaClock, FaTimesCircle, FaPlus, FaSpinner, FaFilter } from 'react-icons/fa';

const PatientAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('upcoming'); // upcoming, past, cancelled

    const mockAppointments = [
        { id: 1, doctor: { name: 'Dr. Emily Carter', speciality: 'Cardiology' }, appointment_time: '2024-06-20T10:00:00Z', status: 'confirmed', notes: 'Annual Checkup' },
        { id: 2, doctor: { name: 'Dr. John Smith', speciality: 'Dermatology' }, appointment_time: '2024-06-25T14:30:00Z', status: 'confirmed', notes: 'Skin rash consultation' },
        { id: 3, doctor: { name: 'Dr. Sarah Lee', speciality: 'Pediatrics' }, appointment_time: '2024-05-10T09:00:00Z', status: 'completed', notes: "Kid's vaccination" },
    ];

    const fetchAppointments = useCallback(async (currentFilter) => {
        setLoading(true);
        // try {
        //     const response = await getPatientAppointments({ status: currentFilter });
        //     setAppointments(response.data.appointments || response.data || []);
        //     setError(null);
        // } catch (err) {
        //     setError(err.message || 'Failed to fetch appointments.');
        //     setAppointments([]);
        // } finally {
        //     setLoading(false);
        // }
         setTimeout(() => { // Mock API
            let filtered = mockAppointments;
            const now = new Date();
            if (currentFilter === 'upcoming') {
                filtered = mockAppointments.filter(a => new Date(a.appointment_time) > now && a.status === 'confirmed');
            } else if (currentFilter === 'past') {
                filtered = mockAppointments.filter(a => new Date(a.appointment_time) <= now && a.status === 'completed');
            } else if (currentFilter === 'cancelled') {
                 filtered = mockAppointments.filter(a => a.status.includes('cancelled'));
            }
            setAppointments(filtered);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        fetchAppointments(filter);
    }, [fetchAppointments, filter]);

    const handleCancel = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            // try {
            //     await cancelAppointment(appointmentId);
            //     fetchAppointments(filter); // Refresh list
            //     alert('Appointment cancelled successfully.');
            // } catch (err) {
            //     alert(`Failed to cancel appointment: ${err.response?.data?.message || err.message}`);
            // }
            alert(`Mock cancel appointment ID: ${appointmentId}`);
            setAppointments(prev => prev.map(app => app.id === appointmentId ? {...app, status: 'cancelled_by_patient'} : app).filter(app => app.id !== appointmentId || filter !== 'upcoming'));
        }
    };
    
    const AppointmentCard = ({ appointment }) => (
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
             <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-indigo-700 flex items-center">
                    <FaUserMd className="mr-2"/> Dr. {appointment.doctor.name}
                </h3>
                 <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status.includes('cancelled') ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {appointment.status.replace('_', ' ')}
                </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{appointment.doctor.speciality}</p>
            <p className="text-sm text-gray-700 flex items-center mb-1"><FaCalendarAlt className="mr-2 text-gray-500"/> Date: {new Date(appointment.appointment_time).toLocaleDateString()}</p>
            <p className="text-sm text-gray-700 flex items-center mb-3"><FaClock className="mr-2 text-gray-500"/> Time: {new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            {appointment.notes && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">Reason: {appointment.notes}</p>}
            
            {filter === 'upcoming' && appointment.status === 'confirmed' && (
                 <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                    <button onClick={() => handleCancel(appointment.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded-md flex items-center">
                        <FaTimesCircle className="mr-1"/> Cancel Appointment
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-white">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 drop-shadow">My Appointments</h1>
                <Link to="/doctors" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center self-start md:self-center transition-all duration-200">
                    <FaPlus className="mr-2"/> Book New Appointment
                </Link>
            </div>
            <div className="mb-6 flex items-center space-x-2 bg-white p-3 rounded-lg shadow">
                <FaFilter className="text-gray-500"/>
                <label htmlFor="filter" className="text-sm font-medium text-gray-700">Show:</label>
                <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="all">All</option>
                </select>
            </div>

            {loading && (
                <div className="p-6 text-center flex justify-center items-center min-h-[200px]">
                    <FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />
                    Loading appointments...
                </div>
            )}
            {error && !loading && (
                <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg shadow mb-6">
                    Error: {error}
                </div>
            )}
            
            {!loading && !error && (
                appointments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {appointments.map(app => <AppointmentCard key={app.id} appointment={app} />)}
                    </div>
                ) : (
                    <div className="text-center text-gray-600 bg-white p-10 rounded-lg shadow flex flex-col items-center">
                        <FaCalendarAlt className="text-4xl text-indigo-200 mb-4"/>
                        No appointments found for this filter.
                    </div>
                )
            )}
        </div>
    );
};
export default PatientAppointmentsPage;