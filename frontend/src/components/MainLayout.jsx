// src/components/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
// import Footer from './Footer'; // If you have a separate Footer component

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-100"> 
                {/* Adding some default padding, but individual pages might override or add more.
                  Consider removing default padding here if pages handle it entirely.
                */}
                <div className="py-2"> {/* Reduced default padding, pages should manage their own */}
                    <Outlet />
                </div>
            </main>
            {/* <Footer /> // Uncomment if you have a Footer component */}
            {/* Basic footer example if not using a separate component, can be removed if HomePage has its own or Navbar includes it */}
            {/* <footer className="bg-gray-800 text-white py-8 text-center">
                <p>&copy; {new Date().getFullYear()} SihaTech. All rights reserved.</p>
            </footer> */}
        </div>
    );
};

export default MainLayout;
