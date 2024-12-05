// src/app/contactUs/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import ChatComponent from '@/components/ChatComponent';
import MessesNavBar from '@/components/MessesNavBar';
import Link from 'next/link';

const ContactUsPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUsername = localStorage.getItem("username");
            const storedToken = localStorage.getItem("token");
            if (storedUsername && storedToken) {
                setIsLoggedIn(true);
            }
        }
    }, []);

    return (
        
        <div className='h-full'>
            <MessesNavBar />
         

         

            <div className="p-4 mb-12">
                {isLoggedIn ? (
                    <ChatComponent />
                ) : (
                    <div className="  max-w-full sm:max-w-4xl mx-auto p-4 sm:p-6 space-y-6 bg-white rounded-lg shadow-md mt-48 mb-60 text-center">
                        
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Please Log In to Use the Chat
                        </h2>
                        <p className="text-gray-600">
                            You need to be logged in to access the chat feature. Please{' '}
                            <Link href="/smsLogin" className="text-blue-500 hover:underline">
                                log in
                            </Link>{' '}
                            or{' '}
                            <Link href="/register" className="text-blue-500 hover:underline">
                                register
                            </Link>{' '}
                            to start chatting with us.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactUsPage;
