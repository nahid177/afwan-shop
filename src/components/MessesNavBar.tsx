// src/components/MessesNavBar.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Transition } from "@headlessui/react";
import { FiMenu, FiX } from "react-icons/fi";

const MessesNavBar: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Check if the user is logged in by looking for a username in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    router.push("/smsLogin");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section: Logo or Title */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#"
              className="text-xl font-bold text-gray-800 hover:text-blue-600"
            >
              Contact Us
            </a>
          </div>

          {/* Right Section: User Options */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {username ? (
              <div className="flex items-center space-x-4">
                <span className="text-lg text-gray-700">Hello, {username}</span>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  onClick={() => router.push("/smsLogin")}
                >
                  Login
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                  onClick={() => router.push("/register")}
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={isMenuOpen}
        enter="transition ease-out duration-200 transform"
        enterFrom="-translate-y-full opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-150 transform"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="-translate-y-full opacity-0"
      >
        {/* 
          The child function receives a 'ref' and other props.
          Destructure 'ref' and 'className' from the props and spread them onto the div.
        */}
        {(refProps) => (
          <div className="md:hidden">
            <div
              {...refProps}
              className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white"
            >
              {username ? (
                <div className="flex flex-col items-start space-y-4">
                  <span className="text-lg text-gray-700">Hello, {username}</span>
                  <button
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-start space-y-2">
                  <button
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    onClick={() => router.push("/smsLogin")}
                  >
                    Login
                  </button>
                  <button
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                    onClick={() => router.push("/register")}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Transition>
    </nav>
  );
};

export default MessesNavBar;
