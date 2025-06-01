// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaCalendarCheck, FaSearch, FaShieldAlt, FaBlog, FaQuestionCircle } from 'react-icons/fa'; // Example icons

const FeatureCard = ({ icon, title, description, linkTo, linkText }) => (
    <div className="bg-white shadow-xl rounded-xl p-8 hover:shadow-2xl transition-shadow duration-300 flex flex-col">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">{title}</h3>
        <p className="text-gray-600 text-sm mb-6 text-center flex-grow">{description}</p>
        <Link 
            to={linkTo} 
            className="mt-auto block w-full text-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
        >
            {linkText}
        </Link>
    </div>
);

const HomePage = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                        Welcome to <span className="block text-blue-300 xl:inline">SihaTech</span>
                    </h1>
                    <p className="mt-6 max-w-md mx-auto text-lg sm:text-xl text-indigo-100 md:mt-8 md:max-w-3xl">
                        Your trusted platform for seamless healthcare connections. Find expert doctors, book appointments, and manage your health journey with ease.
                    </p>
                    <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                        <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                            <Link
                                to="/doctors"
                                className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8 transition-colors duration-300"
                            >
                                Find a Doctor
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-opacity-75 sm:px-8 transition-colors duration-300"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Everything You Need for Better Health
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover a range of services designed to make your healthcare experience simpler and more effective.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <FeatureCard 
                            icon={<FaSearch className="h-8 w-8" />}
                            title="Find Doctors Easily"
                            description="Search our extensive network of qualified doctors by specialty, location, and more. Read patient reviews to make informed choices."
                            linkTo="/doctors"
                            linkText="Search Doctors"
                        />
                        <FeatureCard 
                            icon={<FaCalendarCheck className="h-8 w-8" />}
                            title="Effortless Booking"
                            description="View doctor availability and book appointments online in just a few clicks. Get reminders and manage your schedule on the go."
                            linkTo="/doctors" // Or a dedicated booking page if user is logged in
                            linkText="Book Now"
                        />
                        <FeatureCard 
                            icon={<FaUserMd className="h-8 w-8" />}
                            title="For Healthcare Professionals"
                            description="Join our platform to expand your reach, manage your schedule efficiently, and connect with patients seeking your expertise."
                            linkTo="/register" // Or a specific doctor registration/info page
                            linkText="Join as a Doctor"
                        />
                         <FeatureCard 
                            icon={<FaShieldAlt className="h-8 w-8" />}
                            title="Secure & Confidential"
                            description="Your privacy is our priority. We use robust security measures to protect your personal and health information."
                            linkTo="/privacy-policy" // Placeholder
                            linkText="Learn More"
                        />
                         <FeatureCard 
                            icon={<FaBlog className="h-8 w-8" />}
                            title="Health & Wellness Blog"
                            description="Stay informed with our articles on various health topics, wellness tips, and updates in the medical field."
                            linkTo="/blog" // Placeholder
                            linkText="Read Articles"
                        />
                         <FeatureCard 
                            icon={<FaQuestionCircle className="h-8 w-8" />}
                            title="Support & FAQ"
                            description="Have questions? Our support team is here to help. Find answers to common queries in our FAQ section."
                            linkTo="/faq" // Placeholder
                            linkText="Get Help"
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-indigo-50 py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Ready to Take Control of Your Health?
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Sign up today and experience a new standard in healthcare access and management.
                    </p>
                    <div className="mt-8">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                            Create Your Free Account
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* Footer placeholder - MainLayout might have a proper footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} SihaTech. All rights reserved.</p>
                    <p className="mt-2">
                        <Link to="/terms" className="hover:text-indigo-300">Terms of Service</Link> | <Link to="/privacy" className="hover:text-indigo-300">Privacy Policy</Link>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
