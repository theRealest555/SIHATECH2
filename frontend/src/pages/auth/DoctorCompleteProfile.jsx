// src/pages/auth/DoctorCompleteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios'; // For fetching specialities, languages, locations
import { FaUserMd, FaBriefcaseMedical, FaLanguage, FaMapMarkerAlt, FaGraduationCap, FaPaperPlane } from 'react-icons/fa';

const DoctorCompleteProfilePage = () => {
    const { user, completeDoctorProfile, loading: authLoading, authError, fetchUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone_number: '',
        bio: '',
        address_line1: '',
        city: '',
        country: '', // Consider a country dropdown
        postal_code: '',
        speciality_id: '',
        experience_years: '',
        consultation_fee: '',
        languages: [], // Array of language IDs
        // Add other fields as per your CompleteProfileRequest
        // e.g., education, certifications
    });

    const [specialities, setSpecialities] = useState([]);
    const [languagesList, setLanguagesList] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [formError, setFormError] = useState(null);


    useEffect(() => {
        // Redirect if user is not a doctor or profile is already complete
        if (user && user.role !== 'doctor') {
            navigate('/dashboard');
        }
        if (user && user.doctor_profile_completed) {
             navigate('/doctor/dashboard');
        }

        const fetchData = async () => {
            setPageLoading(true);
            try {
                const [specRes, langRes] = await Promise.all([
                    axios.get('/api/doctors/specialities'), // Public endpoint
                    axios.get('/api/doctors/languages')   // Public endpoint
                ]);
                setSpecialities(specRes.data.specialities || specRes.data); // Adjust based on actual API response structure
                setLanguagesList(langRes.data.languages || langRes.data);
            } catch (error) {
                console.error("Failed to fetch initial data for profile completion:", error);
                setFormError("Could not load necessary data. Please try again later.");
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, [user, navigate]);
    
    useEffect(() => {
        if (authError) {
            setFormError(authError);
        }
    }, [authError]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLanguageChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const newLanguages = checked
                ? [...prev.languages, parseInt(value)]
                : prev.languages.filter(langId => langId !== parseInt(value));
            return { ...prev, languages: newLanguages };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        const result = await completeDoctorProfile(formData);
        if (result.success) {
            await fetchUser(); // Ensure user context is updated with completion status
            navigate('/doctor/dashboard');
        } else {
             if (result.error && result.error.errors) {
                // Handle Laravel validation errors
                const errors = Object.values(result.error.errors).flat().join(' ');
                setFormError(errors);
            } else {
                setFormError(result.error?.message || "An unknown error occurred.");
            }
        }
    };
    
    if (pageLoading || !user) {
        return <div className="flex justify-center items-center min-h-screen"><FaUserMd className="animate-ping h-10 w-10 text-indigo-600" /> Loading profile form...</div>;
    }
    if (user.doctor_profile_completed) {
         // This should ideally be caught by the useEffect redirect, but as a safeguard
        return <div className="p-6 text-center">Your profile is already complete. Redirecting...</div>;
    }


    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-lg p-8 md:p-12">
                    <div className="text-center mb-8">
                        <FaUserMd className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
                        <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Doctor Profile</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Hello Dr. {user.last_name || user.name}! Please provide additional details to activate your profile.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formError && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{formError}</p>}

                        {/* Contact & Bio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., +1234567890"/>
                            </div>
                             <div>
                                <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                <input type="number" name="experience_years" id="experience_years" value={formData.experience_years} onChange={handleChange} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., 5"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biography / Professional Statement</label>
                            <textarea name="bio" id="bio" rows="4" value={formData.bio} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Tell patients about your expertise and approach..."></textarea>
                        </div>

                        {/* Location */}
                        <fieldset className="border border-gray-300 p-4 rounded-md">
                            <legend className="text-lg font-medium text-gray-900 px-2 flex items-center"><FaMapMarkerAlt className="mr-2 text-indigo-600" /> Practice Location</legend>
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                    <input type="text" name="address_line1" id="address_line1" value={formData.address_line1} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2" placeholder="123 Main St"/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                        <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2" placeholder="Healthcare City"/>
                                    </div>
                                    <div>
                                        <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                        <input type="text" name="postal_code" id="postal_code" value={formData.postal_code} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2" placeholder="90210"/>
                                    </div>
                                     <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                        <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm p-2" placeholder="Your Country"/>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        
                        {/* Speciality and Languages */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label htmlFor="speciality_id" className="block text-sm font-medium text-gray-700 flex items-center"><FaBriefcaseMedical className="mr-2 text-indigo-600" /> Speciality</label>
                                <select name="speciality_id" id="speciality_id" value={formData.speciality_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    <option value="">Select Speciality</option>
                                    {specialities.map(spec => <option key={spec.id} value={spec.id}>{spec.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="consultation_fee" className="block text-sm font-medium text-gray-700">Consultation Fee (e.g., USD)</label>
                                <input type="number" name="consultation_fee" id="consultation_fee" value={formData.consultation_fee} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., 75.00"/>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><FaLanguage className="mr-2 text-indigo-600" /> Languages Spoken</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto border p-3 rounded-md">
                                {languagesList.length > 0 ? languagesList.map(lang => (
                                    <div key={lang.id} className="flex items-center">
                                        <input 
                                            id={`lang-${lang.id}`} 
                                            name="languages" 
                                            type="checkbox" 
                                            value={lang.id} 
                                            checked={formData.languages.includes(lang.id)}
                                            onChange={handleLanguageChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`lang-${lang.id}`} className="ml-2 text-sm text-gray-700">{lang.name}</label>
                                    </div>
                                )) : <p className="text-sm text-gray-500 col-span-full">No languages available to select.</p>}
                            </div>
                        </div>
                        
                        {/* Placeholder for education, etc. Add more fields as needed */}
                        {/* <div>
                            <label htmlFor="education" className="block text-sm font-medium text-gray-700 flex items-center"><FaGraduationCap className="mr-2 text-indigo-600" /> Education & Certifications</label>
                            <textarea name="education" id="education" rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="List your degrees, certifications, etc."></textarea>
                        </div>
                        */}

                        <div className="pt-5">
                            <button 
                                type="submit" 
                                disabled={authLoading}
                                className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition duration-150"
                            >
                                {authLoading ? 'Saving Profile...' : 'Save and Complete Profile'}
                                {!authLoading && <FaPaperPlane className="ml-2 h-5 w-5" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DoctorCompleteProfilePage;

