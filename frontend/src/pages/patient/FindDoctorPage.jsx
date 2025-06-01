// src/pages/patient/FindDoctorPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import { searchDoctorsAdvanced, getSpecialities, getLanguages } from '../../services/doctorService'; // Assuming public doctor service
import { FaSearch, FaUserMd, FaMapMarkerAlt, FaLanguage, FaStar, FaFilter, FaSpinner } from 'react-icons/fa';

const FindDoctorPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false); // Set to false initially, true on search
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ name: '', speciality_id: '', location: '', language_id: '', availability_date: '' });
    const [specialities, setSpecialities] = useState([]);
    const [languages, setLanguages] = useState([]);

    const mockDoctors = [
        { id: 1, user: { first_name: 'Emily', last_name: 'Carter', profile_image_url: null }, speciality: { name: 'Cardiology' }, location: { city: 'New York' }, average_rating: 4.8, consultation_fee: 150 },
        { id: 2, user: { first_name: 'John', last_name: 'Smith', profile_image_url: null }, speciality: { name: 'Dermatology' }, location: { city: 'Los Angeles' }, average_rating: 4.5, consultation_fee: 120 },
        { id: 3, user: { first_name: 'Sarah', last_name: 'Lee', profile_image_url: null }, speciality: { name: 'Pediatrics' }, location: { city: 'Chicago' }, average_rating: 4.9, consultation_fee: 100 },
    ];
     const mockSpecialities = [{id: 1, name: 'Cardiology'}, {id: 2, name: 'Dermatology'}, {id: 3, name: 'Pediatrics'}];
     const mockLanguages = [{id: 1, name: 'English'}, {id: 2, name: 'Spanish'}];


    const fetchInitialData = useCallback(async () => {
        // try {
        //     const [specRes, langRes] = await Promise.all([
        //         getSpecialities(),
        //         getLanguages()
        //     ]);
        //     setSpecialities(specRes.data.specialities || specRes.data || []);
        //     setLanguages(langRes.data.languages || langRes.data || []);
        // } catch (err) {
        //     console.error("Failed to fetch filter data:", err);
        //     setError("Could not load filter options.");
        // }
        setSpecialities(mockSpecialities);
        setLanguages(mockLanguages);
    }, []);

    useEffect(() => {
        fetchInitialData();
        // Optionally, fetch all doctors initially or wait for search
        // handleSearch(); // if you want to load all doctors initially
    }, [fetchInitialData]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = async (e) => {
        if(e) e.preventDefault();
        setLoading(true);
        setError(null);
        // try {
        //     const response = await searchDoctorsAdvanced(filters); // Use advanced search
        //     setDoctors(response.data.doctors || response.data || []);
        // } catch (err) {
        //     setError(err.message || 'Failed to search doctors.');
        //     setDoctors([]);
        // } finally {
        //     setLoading(false);
        // }
        setTimeout(() => { // Mock API search
            const filtered = mockDoctors.filter(doc => 
                (filters.name ? `${doc.user.first_name} ${doc.user.last_name}`.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
                (filters.speciality_id ? doc.speciality.name.toLowerCase() === mockSpecialities.find(s => s.id.toString() === filters.speciality_id)?.name.toLowerCase() : true) &&
                (filters.location ? doc.location.city.toLowerCase().includes(filters.location.toLowerCase()) : true)
                // Add language and availability date filtering if needed
            );
            setDoctors(filtered);
            setLoading(false);
        }, 1000);
    };
    
    const DoctorCard = ({ doctor }) => (
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <div className="flex items-start mb-4">
                <img 
                    src={doctor.user.profile_image_url || `https://ui-avatars.com/api/?name=${doctor.user.first_name}+${doctor.user.last_name}&background=0D8ABC&color=fff&size=128`} 
                    alt={`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`} 
                    className="h-20 w-20 rounded-full mr-4 object-cover border-2 border-indigo-100"
                />
                <div>
                    <h3 className="text-xl font-semibold text-indigo-700">Dr. {doctor.user.first_name} {doctor.user.last_name}</h3>
                    <p className="text-sm text-gray-600">{doctor.speciality.name}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1"><FaMapMarkerAlt className="mr-1"/>{doctor.location.city}</p>
                </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-700 mb-3">
                <span className="flex items-center"><FaStar className="text-yellow-400 mr-1"/> {doctor.average_rating || 'N/A'}</span>
                <span>Fee: ${doctor.consultation_fee || 'N/A'}</span>
            </div>
            {/* <p className="text-xs text-gray-500 mb-4 flex-grow">Short bio or description placeholder...</p> */}
            <Link 
                to={`/doctors/${doctor.id}`} 
                className="mt-auto block w-full text-center bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-150 text-sm"
            >
                View Profile & Book
            </Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Find Your Doctor</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Search by name, specialty, location, or availability to find the perfect healthcare professional for your needs.</p>
            </header>

            <form onSubmit={handleSearch} className="bg-white shadow-xl rounded-lg p-6 mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Doctor's Name</label>
                    <input type="text" name="name" id="name" value={filters.name} onChange={handleFilterChange} placeholder="e.g., Dr. Smith" className="mt-1 w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div className="lg:col-span-1">
                    <label htmlFor="speciality_id" className="block text-sm font-medium text-gray-700">Speciality</label>
                    <select name="speciality_id" id="speciality_id" value={filters.speciality_id} onChange={handleFilterChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">All Specialities</option>
                        {specialities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div className="lg:col-span-1">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (City)</label>
                    <input type="text" name="location" id="location" value={filters.location} onChange={handleFilterChange} placeholder="e.g., New York" className="mt-1 w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div className="lg:col-span-1">
                    <label htmlFor="availability_date" className="block text-sm font-medium text-gray-700">Availability Date</label>
                    <input type="date" name="availability_date" id="availability_date" value={filters.availability_date} onChange={handleFilterChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div className="lg:col-span-1">
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md flex items-center justify-center h-[46px]">
                        {loading ? <FaSpinner className="animate-spin h-5 w-5"/> : <FaSearch className="h-5 w-5 mr-2"/>}
                        {loading ? '' : 'Search'}
                    </button>
                </div>
            </form>

            {error && <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg shadow mb-6">Error: {error}</div>}
            
            {loading && (
                <div className="text-center py-10">
                    <FaSpinner className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-3"/>
                    <p className="text-gray-600">Searching for doctors...</p>
                </div>
            )}

            {!loading && doctors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map(doc => <DoctorCard key={doc.id} doctor={doc} />)}
                </div>
            )}
            {!loading && doctors.length === 0 && !error && (
                 <div className="text-center py-10 bg-white shadow-lg rounded-lg">
                    <FaUserMd className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                    <p className="text-gray-600 text-lg">No doctors found matching your criteria. Try broadening your search.</p>
                </div>
            )}
        </div>
    );
};
export default FindDoctorPage;