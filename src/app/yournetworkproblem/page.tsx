"use client";

import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import Link from "next/link";

const NetworkProblemPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <FiAlertCircle className="text-red-500 mx-auto text-6xl mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Slow or Unstable Network
        </h1>
        <p className="text-gray-600 mb-6">
          Your internet connection seems to be slow or unstable. This might
          affect your experience. Please check your network connection.
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <Link href="/">
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all">
              Go to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NetworkProblemPage;
