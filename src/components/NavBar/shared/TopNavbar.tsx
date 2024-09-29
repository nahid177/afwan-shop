"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from 'next/image'; // Import Next.js Image component
import { CiBookmarkCheck } from "react-icons/ci"; // Import the CiBookmarkCheck icon
import { FiShoppingCart, FiSearch, FiMenu, FiSun, FiMoon, FiBell, FiTrash2 } from "react-icons/fi"; // Other icons

// Mock data for cart items
const cartItems = [
  { id: 1, name: "Wireless Headphones", price: 120, quantity: 1, imageUrl: "/images/item1.jpg" },
  { id: 2, name: "Smart Watch", price: 220, quantity: 2, imageUrl: "/images/item2.jpg" },
];

const TopNavbar: React.FC = () => {
  const [theme, setTheme] = useState<string>("light");
  const [searchQuery, setSearchQuery] = useState<string>(""); // State to store search query
  const [searchOpen, setSearchOpen] = useState<boolean>(false); // State to toggle search bar visibility
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false); // State for cart drawer
  const searchInputRef = useRef<HTMLInputElement | null>(null); // Ref to manage the input focus
  const drawerRef = useRef<HTMLDivElement | null>(null); // Ref to handle drawer close outside click

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setDrawerOpen(false); // Close the drawer if clicked outside
      }
    };

    if (drawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [drawerOpen]);

  // Calculate the total amount and total quantity in the cart
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`navbar px-32 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      {/* Navbar Start */}
      <div className="navbar-start">
        <div className="dropdown">
          <button tabIndex={0} className="btn btn-ghost btn-circle">
            <FiMenu className={`h-5 w-5 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} /> {/* Menu Icon */}
          </button>
          <ul
            tabIndex={0}
            className={`menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow ${
              theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
            }`}
          >
            <li><a href="#">Homepage</a></li>
            <li><a href="#">Portfolio</a></li>
            <li><a href="#">About</a></li>
          </ul>
        </div>
      </div>

      {/* Navbar Center */}
      <div className="navbar-center">
        <a className="btn btn-ghost text-xl font-bold">Afwan Shop</a>
      </div>

      {/* Navbar End */}
      <div className="navbar-end flex items-center space-x-4">
        {/* Toggle Search Bar on Icon Click */}
        <div className="relative">
          <button className="btn btn-ghost btn-circle" onClick={toggleSearch}>
            <FiSearch className={`h-5 w-5 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} /> {/* Search Icon */}
          </button>
          {searchOpen && (
            <div className="absolute right-0 mt-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
                className={`input input-bordered rounded-full w-64 ${
                  theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
                }`}
              />
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <FiBell className={`h-5 w-5 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>

        {/* CiBookmarkCheck (new wishlist icon) */}
        <button className="btn btn-ghost btn-circle">
          <CiBookmarkCheck className={`h-5 w-5 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} style={{ strokeWidth: 0.9 }} /> {/* CiBookmarkCheck icon */}
        </button>

        {/* Cart Icon */}
        <button className="btn btn-ghost btn-circle" onClick={toggleDrawer}>
          <div className="indicator">
            <FiShoppingCart className={`h-5 w-5 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} style={{ strokeWidth: 2.5 }} />
            {totalQuantity > 0 && (
              <span className="badge badge-xs badge-primary indicator-item">{totalQuantity}</span>
            )}
          </div>
        </button>

        {/* Theme Toggle */}
        <label className="swap swap-rotate">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
            className="hidden"
          />
          {theme === "light" ? (
            <FiSun className="h-6 w-6 text-yellow-500" />
          ) : (
            <FiMoon className="h-6 w-6 text-white" />
          )}
        </label>
      </div>

      {/* Cart Drawer (Right Drawer) */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-80 shadow-2xl rounded-l-lg transform ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 overflow-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium">Your cart is currently empty.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map(item => (
                <li key={item.id} className="flex justify-between items-center border-b pb-4">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name} 
                    width={64} 
                    height={64} 
                    className="rounded-lg object-cover" 
                  />
                  <div className="flex-1 ml-4">
                    <div className="text-lg">{item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">x{item.quantity}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">${item.price * item.quantity}</span>
                    <FiTrash2 className="text-red-500 cursor-pointer" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t dark:border-gray-700">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">${totalAmount}</span>
            </div>
            <button className="btn btn-gradient-blue w-full rounded-full py-3 text-lg">
              Place Order
              <span className="ml-2 badge badge-secondary">{totalQuantity}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNavbar;
