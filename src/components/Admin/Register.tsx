"use client";
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from "@/mode/ThemeContext"; // Assuming you have a ThemeContext for managing dark/light mode
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Link from 'next/link'; // Import Link for client-side navigation

const Register = () => {
  const { theme } = useTheme(); // Get the current theme (light or dark)
  const router = useRouter(); // Initialize the router for navigation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [toast, setToast] = useState({ type: '', message: '' });

  // On component mount, either fetch the existing deviceId from localStorage or create a new one
  useEffect(() => {
    let storedDeviceId = localStorage.getItem('deviceId');
    
    if (!storedDeviceId) {
      // Generate a new deviceId if it doesn't exist
      storedDeviceId = uuidv4();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    
    // Set the deviceId in state
    setDeviceId(storedDeviceId);
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    setLoading(true); // Set loading state when form is submitted

    // Prepare the registration data
    const data = {
      username,
      password,
      deviceId, // Automatically handled
    };

    // Call the registration API
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.status === 201) {
        // Successful registration - show success toast
        setToast({ type: 'success', message: 'Registration successful!' });
        setUsername(''); // Clear the username
        setPassword(''); // Clear the password
        
        // Redirect to the login page after a short delay (optional)
        setTimeout(() => {
          router.push('/login'); // Redirect to the login page
        }, 2000); // Redirect after 2 seconds (optional)
      } else {
        // Handle errors - show error toast
        setToast({ type: 'error', message: result.message });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setToast({ type: 'error', message: 'An error occurred during registration.' });
    } finally {
      setLoading(false); // Reset loading state after submission
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-6 lg:py-12 ${theme === "light" ? "bg-base-100 text-black" : "bg-gray-900 text-white"}`}>
      <div className="flex flex-col lg:flex-row-reverse items-center max-w-4xl w-full space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Text Section */}
        <div className="text-center lg:text-left flex-1 px-6">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Register Now!</h1>
          <p className="text-sm md:text-base lg:text-lg">
            Create your admin account by filling in the details below. You can register up to 2 devices.
          </p>
        </div>

        {/* Form Section */}
        <div className={`card w-full max-w-sm md:max-w-lg lg:max-w-md shadow-2xl p-6 ${theme === "light" ? "bg-base-100" : "bg-gray-800"}`}>
          <form className="w-full" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="form-control mb-4">
              <label className="label">
                <span className={`label-text ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className={`input input-bordered w-full ${theme === "light" ? "" : "bg-gray-700 text-white"}`}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="form-control mb-4">
              <label className="label">
                <span className={`label-text ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className={`input input-bordered w-full ${theme === "light" ? "" : "bg-gray-700 text-white"}`}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>

          {/* Display Toast Notification */}
          {toast.message && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs z-50">
              {toast.type === 'success' && (
                <div className={`flex items-center w-full p-4 mb-4 text-gray-500 ${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-lg shadow`} role="alert">
                  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm font-normal">{toast.message}</div>
                </div>
              )}

              {toast.type === 'error' && (
                <div className={`flex items-center w-full p-4 mb-4 text-gray-500 ${theme === "light" ? "bg-white" : "bg-gray-800"} rounded-lg shadow`} role="alert">
                  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm font-normal">{toast.message}</div>
                </div>
              )}
            </div>
          )}

          {/* Link to Admin (Login) Page */}
          <div className="text-center mt-4">
            <p className="text-sm">
              Already have an admin account?{" "}
              <Link href="/login" className="text-blue-500 hover:underline">
                Go to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
