// src/app/smsLogin/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatIcon from '@/components/ChatIcon';

const SmsLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check if the user is already logged in on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');

      if (storedUsername && storedUserId && storedToken) {
        setUsername(storedUsername);
        setIsLoggedIn(true);
        setMessage(`Welcome back, ${storedUsername}!`);
        setMessageType('success');
      }
    }
  }, []);

  // Handle login functionality
  const handleLogin = async () => {
    // Prevent multiple submissions
    if (loading) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (res.status === 200) {
        setMessage('Login successful!');
        setMessageType('success');

        // Store userId, username, and token in localStorage
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('token', data.token); // Store the token
        setIsLoggedIn(true);

        // Redirect to the Contact Us page after a short delay
        setTimeout(() => {
          router.push('/contactUs');
        }, 1500);
      } else {
        setMessage(data.message || 'Login failed.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setMessage('Login failed due to a network error.');
      setMessageType('error');
      // Optionally, redirect to a network problem page
      // router.push('/yournetworkproblem');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout functionality
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('token');
    }
    setUsername('');
    setIsLoggedIn(false);
    setMessage('You have been logged out.');
    setMessageType('success');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      {/* Optional: Add a Chat Icon or Logo */}
      <ChatIcon />

      <div className="card w-full max-w-sm shadow-2xl bg-base-100 mt-8">
        <div className="card-body">
          <h2 className="card-title text-center">SMS Login</h2>

          {isLoggedIn ? (
            <>
              <p className="text-lg text-center mb-4">Hello, {username}!</p>
              <button
                onClick={handleLogout}
                className="btn btn-outline w-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && username.trim()) {
                    handleLogin();
                  }
                }}
              />
              <button
                onClick={handleLogin}
                className={`btn btn-primary w-full mt-4 ${loading ? 'loading' : ''}`}
                disabled={loading || !username.trim()}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              {/* Register Link */}
              <div className="text-center mt-4">
                <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
                <button
                  onClick={() => router.push("/register")}
                  className="text-blue-500 hover:underline text-sm"
                >
                  Register here
                </button>
              </div>
            </>
          )}

          {/* Display Messages */}
          {message && (
            <div
              className={`alert mt-4 ${
                messageType === 'success' ? 'alert-success' : 'alert-error'
              }`}
            >
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsLogin;
