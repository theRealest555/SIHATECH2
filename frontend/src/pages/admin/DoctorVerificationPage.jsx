import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPendingVerificationDoctors, verifyDoctor, rejectDoctorDocument } from '../../services/adminService';
import { FaCheckCircle, FaTimesCircle, FaEye, FaSpinner, FaFileAlt } from 'react-icons/fa';

const DoctorVerificationPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchPendingDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPendingVerificationDoctors();
            // Assuming response.data or response.data.doctors is the array
            setDoctors(response.data.doctors || response.data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching pending doctors:", err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch doctors for verification.');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingDoctors();
    }, [fetchPendingDoctors]);

    const handleApprove = async (doctorId) => {
        if (window.confirm(`Are you sure you want to approve Dr. ID ${doctorId}?`)) {
            try {
                await verifyDoctor(doctorId);
                alert('Doctor approved successfully!');
                fetchPendingDoctors(); // Refresh list
            } catch (err) {
                alert(`Failed to approve doctor: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleReject = async (doctorId) => {
        if (!rejectionReason.trim() && selectedDoctor?.id === doctorId) {
            alert('Please provide a reason for rejection.');
            return;
        }
        if (window.confirm(`Are you sure you want to reject Dr. ID ${doctorId}? Reason: ${rejectionReason}`)) {
            try {
                await rejectDoctorDocument(doctorId, { reason: rejectionReason }); // Backend might expect a reason
                alert('Doctor rejected successfully!');
                setSelectedDoctor(null);
                setRejectionReason('');
                fetchPendingDoctors(); // Refresh list
            } catch (err) {
                alert(`Failed to reject doctor: ${err.response?.data?.message || err.message}`);
            }
        }
    };
    
    const viewDoctorDetails = (doctor) => {
        // In a real app, this might open a modal with more comprehensive details
        // or navigate to a specific doctor detail page for admins.
        // For now, just logging to console or setting for a simple display area.
        setSelectedDoctor(doctor);
        setRejectionReason(''); // Clear reason when selecting new doctor
        console.log("Viewing details for:", doctor);
    };


    if (loading) return <div className="p-6 text-center flex justify-center items-center min-h-[300px]"><FaSpinner className="animate-spin h-8 w-8 text-indigo-600 mr-3" />Loading doctors for verification...</div>;
    if (error) return <div className="p-6 text-center text-red-500 bg-red-100 rounded-md shadow">Error: {error}</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Doctor Verification</h1>

            {doctors.length === 0 && !loading && (
                <p className="text-center text-gray-600 bg-white p-6 rounded-lg shadow">No doctors are currently pending verification.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                    <div key={doctor.id} className="bg-white shadow-xl rounded-lg p-6 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                            <img src={doctor.user?.profile_image_url || `https://ui-avatars.com/api/?name=${doctor.user?.first_name}+${doctor.user?.last_name}&background=random`} alt={`${doctor.user?.first_name} ${doctor.user?.last_name}`} className="h-16 w-16 rounded-full mr-4 object-cover" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Dr. {doctor.user?.first_name} {doctor.user?.last_name}</h2>
                                <p className="text-sm text-gray-600">{doctor.speciality?.name || 'Speciality not set'}</p>
                                <p className="text-xs text-gray-500">User ID: {doctor.user_id}</p>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-1"><strong>Email:</strong> {doctor.user?.email}</p>
                        <p className="text-sm text-gray-700 mb-1"><strong>Phone:</strong> {doctor.phone_number || 'N/A'}</p>
                        <p className="text-sm text-gray-700 mb-3"><strong>Experience:</strong> {doctor.experience_years || 'N/A'} years</p>
                        
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-1">Uploaded Documents:</h4>
                            {doctor.documents && doctor.documents.length > 0 ? (
                                <ul className="list-disc list-inside pl-1 text-sm">
                                    {doctor.documents.map(doc => (
                                        <li key={doc.id} className="text-blue-600 hover:text-blue-800">
                                            <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                                <FaFileAlt className="mr-2"/> {doc.document_type || 'View Document'} ({new Date(doc.uploaded_at).toLocaleDateString()})
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">No documents uploaded or available.</p>}
                        </div>

                        {/* Simple details view area */}
                        {selectedDoctor && selectedDoctor.id === doctor.id && (
                            <div className="my-4 p-3 bg-indigo-50 rounded-md border border-indigo-200">
                                <h3 className="font-semibold text-indigo-700">Rejection Reason:</h3>
                                <textarea 
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason for rejection (optional for approve)"
                                    className="w-full p-2 border border-gray-300 rounded-md mt-1 text-sm"
                                    rows="2"
                                ></textarea>
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => viewDoctorDetails(doctor)} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors">
                                <FaEye className="mr-2"/> {selectedDoctor?.id === doctor.id ? 'Hide Details' : 'Review'}
                            </button>
                            <button onClick={() => handleApprove(doctor.id)} className="text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors">
                                <FaCheckCircle className="mr-2"/> Approve
                            </button>
                            <button onClick={() => handleReject(doctor.id)} className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors">
                                <FaTimesCircle className="mr-2"/> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default DoctorVerificationPage;