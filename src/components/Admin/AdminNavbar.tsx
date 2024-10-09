"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AdminNavbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <nav className="navbar bg-base-100">
      <div className="navbar-start">
        <button className="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </button>
      </div>
      <div className="navbar-center">
        <a className="text-xl">Admin Dashboard</a>
      </div>
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle" onClick={handleLogout}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
