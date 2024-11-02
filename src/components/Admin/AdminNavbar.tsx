// src/components/Admin/AdminNavbar.tsx

"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

const AdminNavbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const deviceId = localStorage.getItem("deviceId");

    if (deviceId) {
      // Send logout request to server to remove deviceId
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        // Remove deviceId and token if logout successful
        localStorage.removeItem("deviceId");
        Cookies.remove("token");
        router.push("/login");
      } else {
        console.error("Failed to log out");
      }
    } else {
      // Fallback if deviceId is missing, simply remove the token and redirect
      Cookies.remove("token");
      router.push("/login");
    }
  };

  return (
    <nav className="navbar bg-white shadow-md p-8">
      {/* Logo / Title Section */}
      <div className="navbar-start">
        <span className="text-2xl font-semibold hidden lg:inline-block">
          Admin Dashboard
        </span>
      </div>

      {/* Centered Navigation Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal space-x-4">
          <li>
            <Link href="/admin/orders" className="text-lg hover:text-primary transition-all">
              Orders
            </Link>
          </li>
          <li>
            <Link href="/admin/reviews" className="text-lg hover:text-primary transition-all">
              Reviews
            </Link>
          </li>
          <li tabIndex={0} className="relative group">
            <Link href="#" className="text-lg hover:text-primary transition-all flex items-center">
              Product Types
              <svg
                className="h-4 w-4 ml-1 transition-transform transform group-hover:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </Link>
            <ul className="absolute hidden group-hover:flex flex-col mt-2 shadow-lg rounded-lg bg-white p-2 space-y-1">
              <li>
                <Link href="/admin/product-types" className="hover:text-primary">
                  View All
                </Link>
              </li>
              <li>
                <Link href="/admin/product-types/create" className="hover:text-primary">
                  Create New
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/admin/deliveryAreas" className="text-lg hover:text-primary transition-all">
              Delivery Areas
            </Link>
          </li>
          <li>
            <Link href="/admin/offerEntries" className="text-lg hover:text-primary transition-all">
              Offer Entries
            </Link>
          </li>
          <li>
            <Link href="/admin/promoCode" className="text-lg hover:text-primary transition-all">
              Promo Codes
            </Link>
          </li>
        </ul>
      </div>

      {/* Right-Side Buttons */}
      <div className="navbar-end">
        <button
          className="btn btn-outline btn-primary hidden lg:inline-block"
          onClick={handleLogout}
        >
          Logout
        </button>

        {/* Dropdown Menu for Mobile */}
        <div className="dropdown dropdown-end lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content mt-2 p-3 shadow-lg bg-white rounded-lg w-52 space-y-1"
          >
            <li>
              <Link href="/admin/orders" className="hover:text-primary">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/reviews" className="hover:text-primary">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/admin/product-types" className="hover:text-primary">
                Product Types
              </Link>
            </li>
            <li>
              <Link href="/admin/product-types/create" className="hover:text-primary">
                Create Product Type
              </Link>
            </li>
            <li>
              <Link href="/admin/deliveryAreas" className="hover:text-primary">
                Delivery Areas
              </Link>
            </li>
            <li>
              <Link href="/admin/offerEntries" className="hover:text-primary">
                Offer Entries
              </Link>
            </li>
            <li>
              <Link href="/admin/promoCode" className="hover:text-primary">
                Promo Codes
              </Link>
            </li>
            <li>
              <button className="btn btn-outline btn-primary w-full" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
