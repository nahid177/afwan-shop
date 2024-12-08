// src/components/AdminNavbar.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname } from 'next/navigation'; // To determine the active route

const AdminNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // Current route path

  const handleLogout = async () => {
    const deviceId = localStorage.getItem("deviceId");

    if (deviceId) {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId }),
      });

      if (response.ok) {
        localStorage.removeItem("deviceId");
        Cookies.remove("token", { path: "/" });
        router.push("/admin/login");
      } else {
        console.error("Failed to log out");
      }
    } else {
      Cookies.remove("token", { path: "/" });
      router.push("/admin/login");
    }
  };

  // Helper function to determine if a link is active
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="navbar bg-white shadow-md p-8">
      {/* Navbar Start */}
      <div className="navbar-start">
        <Link href="/admin" className="text-2xl font-semibold lg:inline-block">
          Admin Dashboard
        </Link>
      </div>

      {/* Navbar Center - Desktop Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal space-x-4">
          <li className={isActive("/admin") ? "active" : ""}>
            <Link href="/admin" className="text-lg hover:text-primary transition-all">
              Home
            </Link>
          </li>

          {/* Orders Dropdown */}
          <li tabIndex={0} className="relative group">
            <Link href="#" className="text-lg hover:text-primary transition-all flex items-center">
              Orders
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
                <Link href="/admin/orders" className={`hover:text-primary ${isActive("/admin/orders") ? "font-bold" : ""}`}>
                  View Orders
                </Link>
              </li>
              <li>
                <Link href="/admin/storeOrders" className={`hover:text-primary ${isActive("/admin/storeOrders") ? "font-bold" : ""}`}>
                  Store Orders
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <Link href="/admin/reviews" className={`text-lg hover:text-primary transition-all ${isActive("/admin/reviews") ? "active" : ""}`}>
              Reviews
            </Link>
          </li>

          {/* Product Types Dropdown */}
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
                <Link href="/admin/product-types" className={`hover:text-primary ${isActive("/admin/product-types") ? "font-bold" : ""}`}>
                  View All
                </Link>
              </li>
              <li>
                <Link href="/admin/product-types/create" className={`hover:text-primary ${isActive("/admin/product-types/create") ? "font-bold" : ""}`}>
                  Create New
                </Link>
              </li>
            </ul>
          </li>

          {/* Carousel Dropdown */}
          <li tabIndex={0} className="relative group">
            <Link href="#" className="text-lg hover:text-primary transition-all flex items-center">
              Carousel
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
                <Link href="/admin/carousel" className={`hover:text-primary ${isActive("/admin/carousel") ? "font-bold" : ""}`}>
                  View Carousel
                </Link>
              </li>
              <li>
                <Link href="/admin/carousel/create" className={`hover:text-primary ${isActive("/admin/carousel/create") ? "font-bold" : ""}`}>
                  Create Carousel
                </Link>
              </li>
            </ul>
          </li>

          {/* Delivery Areas and Offer Entries Combined Dropdown */}
          <li tabIndex={0} className="relative group">
            <Link href="#" className="text-lg hover:text-primary transition-all flex items-center">
              Delivery & Offers
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
                <Link href="/admin/deliveryAreas" className={`hover:text-primary ${isActive("/admin/deliveryAreas") ? "font-bold" : ""}`}>
                  Delivery Areas
                </Link>
              </li>
              <li>
                <Link href="/admin/offerEntries" className={`hover:text-primary ${isActive("/admin/offerEntries") ? "font-bold" : ""}`}>
                  Offer Entries
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <Link href="/admin/promoCode" className={`text-lg hover:text-primary transition-all ${isActive("/admin/promoCode") ? "active" : ""}`}>
              Promo Codes
            </Link>
          </li>
          <li>
            <Link href="/admin/profit" className={`text-lg hover:text-primary transition-all ${isActive("/admin/profit") ? "active" : ""}`}>
              Account Calculation
            </Link>
          </li>
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end">
        {/* Logout Button - Desktop */}
        <button
          className="btn btn-outline btn-primary hidden lg:inline-block"
          onClick={handleLogout}
        >
          Logout
        </button>

        {/* Mobile Menu Dropdown */}
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
              <Link href="/admin" className={`hover:text-primary ${isActive("/admin") ? "font-bold" : ""}`}>
                Home
              </Link>
            </li>

            {/* Orders Dropdown - Mobile */}
            <li tabIndex={0} className="relative group">
              <div className="flex items-center justify-between w-full hover:text-primary cursor-pointer">
                <span>Orders</span>
                <svg
                  className="h-4 w-4 ml-1 transition-transform transform group-hover:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </div>
              <ul className="hidden group-hover:flex flex-col mt-2 ml-2 shadow-lg rounded-lg bg-white p-2 space-y-1">
                <li>
                  <Link href="/admin/orders" className={`hover:text-primary ${isActive("/admin/orders") ? "font-bold" : ""}`}>
                    View Orders
                  </Link>
                </li>
                <li>
                  <Link href="/admin/storeOrders" className={`hover:text-primary ${isActive("/admin/storeOrders") ? "font-bold" : ""}`}>
                    Store Orders
                  </Link>
                </li>
              </ul>
            </li>

            {/* Delivery & Offers Dropdown - Mobile */}
            <li tabIndex={0} className="relative group">
              <div className="flex items-center justify-between w-full hover:text-primary cursor-pointer">
                <span>Delivery & Offers</span>
                <svg
                  className="h-4 w-4 ml-1 transition-transform transform group-hover:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </div>
              <ul className="hidden group-hover:flex flex-col mt-2 ml-2 shadow-lg rounded-lg bg-white p-2 space-y-1">
                <li>
                  <Link href="/admin/deliveryAreas" className={`hover:text-primary ${isActive("/admin/deliveryAreas") ? "font-bold" : ""}`}>
                    Delivery Areas
                  </Link>
                </li>
                <li>
                  <Link href="/admin/offerEntries" className={`hover:text-primary ${isActive("/admin/offerEntries") ? "font-bold" : ""}`}>
                    Offer Entries
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link href="/admin/promoCode" className={`hover:text-primary ${isActive("/admin/promoCode") ? "font-bold" : ""}`}>
                Promo Codes
              </Link>
            </li>
            <li>
              <Link href="/admin/profit" className={`hover:text-primary ${isActive("/admin/profit") ? "font-bold" : ""}`}>
                Account Calculation
              </Link>
            </li>
            <li>
              <button className="btn btn-outline btn-primary w-full mt-2" onClick={handleLogout}>
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
