// src/pages/patient/DoctorProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
// import { getPublicDoctorDetails, getDoctorAvailability, getDoctorReviews, addDoctorReview } from '../../services/doctorService'; // Assuming public doctor service
import { useAuth } from '../../hooks/useAuth'; // To check if patient is logged in for reviews
import { FaUserMd, FaMapMarkerAlt, FaGraduationCap, FaLanguage, FaStar, FaCalendarAlt, FaCommentMedical, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const PublicDoctorProfileViewPage = () => {
    const { doctorId } = useParams();
    const { user } = useAuth(); // Get authenticated user
    const [doctor, setDoctor] = useState(null);
    const [availability, setAvailability] = useState([]); // e.g., [{date: '2024-06-20', slots: ['10:00', '10:30']}]
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState({ profile: true, availability: true, reviews: true });
    const [error, setError] = useState(null);

    // Review form state
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    
    // Mock Data
    const mockDoctorDetails = {
        id: parseInt(doctorId),
        user: { first_name: 'Emily', last_name: 'Carter', email: 'emily.carter@example.com', profile_image_url: null },
        speciality: { name: 'Cardiology' },
        location: { address_line1: '123 Health St', city: 'New York', country: 'USA', postal_code: '10001' },
        bio: 'Dedicated cardiologist with 10+ years of experience in treating heart conditions. Passionate about patient education and preventive care.',
        experience_years: 12,
        consultation_fee: 150,
        languages: [{name: 'English'}, {name: 'Spanish'}],
        education: 'MD from Harvard Medical School, Cardiology Fellowship at Stanford.',
        average_rating: 4.8,
    };
    const mockAvailability = [
        { date: '2024-06-20', slots: ['10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM'] },
        { date: '2024-06-21', slots: ['09:00 AM', '09:30 AM', '03:00 PM', '03:30 PM'] },
    ];
    const mockReviews = [
        { id: 1, patient: { name: 'John D.' }, rating: 5, comment: 'Dr. Carter is excellent, very attentive and knowledgeable.', created_at: '2024-05-15T10:00:00Z' },
        { id: 2, patient: { name: 'Alice S.' }, rating: 4, comment: 'Good experience, waiting time was a bit long.', created_at: '2024-05-10T14:00:00Z' },
    ];


    const fetchDoctorData = useCallback(async () => {
        setLoading(prev => ({ ...prev, profile: true, availability: true, reviews: true }));
        // try {
        //     const [profileRes, availRes, reviewRes] = await Promise.all([
        //         getPublicDoctorDetails(doctorId),
        //         getDoctorAvailability(doctorId), // This might need date params
        //         getDoctorReviews(doctorId)
        //     ]);
        //     setDoctor(profileRes.data.doctor || profileRes.data);
        //     setAvailability(availRes.data.availability || []);
        //     setReviews(reviewRes.data.reviews || []);
        //     setError(null);
        // } catch (err) {
        //     setError(err.message || 'Failed to load doctor profile.');
        //     console.error("Error fetching doctor data:", err);
        // } finally {
        //     setLoading({ profile: false, availability: false, reviews: false });
        // }
        setTimeout(() => { // Mock API
            setDoctor(mockDoctorDetails);
            setAvailability(mockAvailability);
            setReviews(mockReviews);
            setLoading({ profile: false, availability: false, reviews: false });
        }, 1000);
    }, [doctorId]);

    useEffect(() => {
        fetchDoctorData();
    }, [fetchDoctorData]);

    const handleReviewChange = (e) => setNewReview({...newReview, [e.target.name]: e.target.value });

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user || user.role !== 'patient') {
            setReviewError('You must be logged in as a patient to submit a review.');
            return;
        }
        if (!newReview.comment.trim() || newReview.rating < 1 || newReview.rating > 5) {
            setReviewError('Please provide a valid rating and comment.');
            return;
        }
        setReviewSubmitting(true);
        setReviewError('');
        // try {
        //     await addDoctorReview(doctorId, { rating: parseInt(newReview.rating), comment: newReview.comment });
        //     setNewReview({ rating: 5, comment: '' });
        //     fetchDoctorData(); // Re-fetch to show new review
        //     alert('Review submitted successfully!');
        // } catch (err) {
        //     setReviewError(err.response?.data?.message || 'Failed to submit review.');
        // } finally {
        //     setReviewSubmitting(false);
        // }
        alert(`Mock review submitted: ${newReview.rating} stars, "${newReview.comment}"`);
        setReviews(prev => [...prev, {id: Date.now(), patient: {name: user.first_name || 'You'}, rating: newReview.rating, comment: newReview.comment, created_at: new Date().toISOString()}]);
        setNewReview({ rating: 5, comment: '' });
        setReviewSubmitting(false);
    };
    
    if (loading.profile) return <div className="p-10 text-center flex justify-center items-center min-h-screen"><FaSpinner className="animate-spin h-10 w-10 text-indigo-600 mr-3"/> Loading doctor's profile...</div>;
    if (error) return <div className="p-10 text-center text-red-500 bg-red-100 rounded-md shadow">Error: {error}</div>;
    if (!doctor) return <div className="p-10 text-center text-gray-600">Doctor not found.</div>;

    return (
        <div className="bg-gray-50 min-h-screen py-8 md:py-12">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
                {/* Profile Header */}
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        <img 
                            className="h-48 w-full object-cover md:w-48 md:h-full" 
                            src={doctor.user.profile_image_url || `https://ui-avatars.com/api/?name=${doctor.user.first_name}+${doctor.user.last_name}&size=256&background=random&color=fff`} 
                            alt={`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`}
                        />
                    </div>
                    <div className="p-8 flex-grow">
                        <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">{doctor.speciality.name}</div>
                        <h1 className="block mt-1 text-3xl leading-tight font-bold text-gray-900">Dr. {doctor.user.first_name} {doctor.user.last_name}</h1>
                        <div className="mt-2 flex items-center text-yellow-500">
                            {[...Array(Math.floor(doctor.average_rating || 0))].map((_, i) => <FaStar key={`star-${i}`} />)}
                            {[...Array(5 - Math.floor(doctor.average_rating || 0))].map((_, i) => <FaStar key={`empty-star-${i}`} className="text-gray-300"/>)}
                            <span className="ml-2 text-gray-600 text-sm">({doctor.average_rating || 'N/A'} average rating)</span>
                        </div>
                        <p className="mt-3 text-gray-600 text-sm">{doctor.bio}</p>
                        <p className="mt-3 text-gray-700 font-semibold">Consultation Fee: ${doctor.consultation_fee || 'N/A'}</p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="border-t border-gray-200">
                    <dl>
                        <DetailItem icon={<FaGraduationCap/>} label="Education & Experience" value={`${doctor.education} (${doctor.experience_years} years experience)`} />
                        <DetailItem icon={<FaMapMarkerAlt/>} label="Practice Location" value={`${doctor.location.address_line1}, ${doctor.location.city}, ${doctor.location.postal_code}, ${doctor.location.country}`} />
                        <DetailItem icon={<FaLanguage/>} label="Languages Spoken" value={doctor.languages.map(lang => lang.name).join(', ')} />
                    </dl>
                </div>

                {/* Availability Section */}
                <div className="p-6 md:p-8 border-t border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><FaCalendarAlt className="mr-2 text-indigo-600"/>Availability</h2>
                    {loading.availability ? <FaSpinner className="animate-spin text-indigo-500"/> : (
                        availability.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {availability.map(day => (
                                    <div key={day.date} className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                        <h4 className="font-semibold text-indigo-700">{new Date(day.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                                        <ul className="mt-2 space-y-1">
                                            {day.slots.map(slot => (
                                                <li key={slot} className="text-sm text-gray-700 bg-white px-2 py-1 rounded shadow-sm">{slot}</li>
                                            ))}
                                        </ul>
                                        <Link to={`/patient/appointments/book?doctorId=${doctorId}&date=${day.date}`} className="mt-3 inline-block bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors">
                                            Book on this day
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-600">No availability information found for the upcoming period. Please check back later or contact the clinic.</p>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="p-6 md:p-8 border-t border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center"><FaCommentMedical className="mr-2 text-indigo-600"/>Patient Reviews</h2>
                    {loading.reviews ? <FaSpinner className="animate-spin text-indigo-500"/> : (
                        reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map(review => <ReviewItem key={review.id} review={review} />)}
                            </div>
                        ) : <p className="text-gray-600">No reviews yet for Dr. {doctor.user.last_name}.</p>
                    )}

                    {/* Add Review Form */}
                    {user && user.role === 'patient' && (
                        <form onSubmit={handleReviewSubmit} className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Leave a Review</h3>
                            {reviewError && <p className="text-red-500 text-sm mb-3 bg-red-100 p-2 rounded">{reviewError}</p>}
                            <div className="mb-3">
                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5 Stars)</label>
                                <select name="rating" id="rating" value={newReview.rating} onChange={handleReviewChange} className="mt-1 w-full sm:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm">
                                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
                                <textarea name="comment" id="comment" value={newReview.comment} onChange={handleReviewChange} rows="4" required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Share your experience..."></textarea>
                            </div>
                            <button type="submit" disabled={reviewSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md flex items-center justify-center min-w-[150px]">
                                {reviewSubmitting ? <FaSpinner className="animate-spin h-5 w-5 mr-2"/> : <FaPaperPlane className="h-4 w-4 mr-2"/>}
                                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                     {!user && (
                        <p className="mt-6 text-sm text-gray-600">
                            <Link to="/login" state={{ from: `/doctors/${doctorId}` }} className="text-indigo-600 hover:underline">Login</Link> to leave a review.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({icon, label, value}) => (
    <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-200 last:border-b-0">
        <dt className="text-sm font-medium text-gray-500 flex items-center">{React.cloneElement(icon, {className: 'mr-2 h-5 w-5 text-indigo-500'})} {label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

const ReviewItem = ({ review }) => (
    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-800">{review.patient.name}</h4>
            <div className="flex items-center text-yellow-500">
                {[...Array(review.rating)].map((_, i) => <FaStar key={`rev-star-${i}`} size={14}/>)}
                {[...Array(5 - review.rating)].map((_, i) => <FaStar key={`rev-empty-${i}`} size={14} className="text-gray-300"/>)}
            </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
        <p className="text-sm text-gray-700">{review.comment}</p>
    </div>
);

export default PublicDoctorProfileViewPage;