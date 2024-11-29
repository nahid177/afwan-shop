// src/components/NavBar/shared/TopNavbar.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiSun,
  FiMoon,
  FiBell,
  FiTrash2,
  FiHome,
  FiX, // Ensure FiX is imported
} from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/mode/ThemeContext";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/Toast/Toast";
import NotificationsDrawer from "@/components/NotificationsDrawer"; // Import the NotificationsDrawer component
import useSWR from "swr"; // Import useSWR
import { Notification } from "@/interfaces/Notification"; // Import Notification interface

interface ProductCategory {
  _id: string;
  catagory_name: string;
}

interface ProductType {
  _id: string;
  types_name: string;
  product_catagory: ProductCategory[];
}

const TopNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // State variables for drawers
  const [menuDrawerOpen, setMenuDrawerOpen] = useState<boolean>(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState<boolean>(false); // New state for Notifications Drawer

  const { cartItems, totalQuantity, totalAmount, removeFromCart, updateQuantity } = useCart();
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Refs for drawers
  const menuDrawerRef = useRef<HTMLDivElement | null>(null);
  const cartDrawerRef = useRef<HTMLDivElement | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  // Define the fetcher function
  const fetcher = (url: string) => axios.get(url).then((res) => res.data.offerEntries);

  // Fetch product types on component mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get("/api/product-types");
        setProductTypes(response.data);
      } catch (error) {
        console.error("Error fetching product types:", error);
      }
    };

    fetchProductTypes();
  }, []);

  // Fetch notifications to get unread count
  const { data: notifications } = useSWR<Notification[]>("/api/offer-entries", fetcher);

  // Calculate unread notifications (assuming isActive represents unread)
  const unreadCount = notifications
    ? notifications.filter((notification) => notification.isActive).length
    : 0;

  // Search toggle functionality
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // Close other drawers
    setMenuDrawerOpen(false);
    setCartDrawerOpen(false);
    setNotificationsDrawerOpen(false); // Close Notifications Drawer when opening search
  };

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality as needed
  };

  // Toggle functions for each drawer
  const toggleMenuDrawer = () => {
    setMenuDrawerOpen(!menuDrawerOpen);
    setCartDrawerOpen(false);
    setSearchOpen(false);
    setNotificationsDrawerOpen(false); // Close Notifications Drawer when opening Menu
  };

  const toggleCartDrawer = () => {
    setCartDrawerOpen(!cartDrawerOpen);
    setMenuDrawerOpen(false);
    setSearchOpen(false);
    setNotificationsDrawerOpen(false); // Close Notifications Drawer when opening Cart
  };

  const toggleNotificationsDrawer = () => {
    setNotificationsDrawerOpen(!notificationsDrawerOpen);
    setMenuDrawerOpen(false);
    setCartDrawerOpen(false);
    setSearchOpen(false); // Close other drawers when opening Notifications
  };

  // Close drawers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuDrawerRef.current &&
        !menuDrawerRef.current.contains(event.target as Node) &&
        menuDrawerOpen
      ) {
        setMenuDrawerOpen(false);
      }
      if (
        cartDrawerRef.current &&
        !cartDrawerRef.current.contains(event.target as Node) &&
        cartDrawerOpen
      ) {
        setCartDrawerOpen(false);
      }
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        searchOpen
      ) {
        setSearchOpen(false);
      }
      if (
        notificationsDrawerOpen &&
        !(event.target as HTMLElement).closest("#notifications-drawer") &&
        !(event.target as HTMLElement).closest("#notifications-button")
      ) {
        setNotificationsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuDrawerOpen, cartDrawerOpen, searchOpen, notificationsDrawerOpen]);

  const isAdminPage = pathname.startsWith("/admin");

  // Render nothing if it's an admin page
  if (isAdminPage) return null;

  return (
    <>
      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            type={toastType}
            message={toastMessage}
            onClose={() => setToastVisible(false)}
          />
        </div>
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsDrawerOpen}
        onClose={() => setNotificationsDrawerOpen(false)}
      />

      {/* Mobile and Tablet Navbar */}
      <div
        className={`navbar ${
          theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
        } py-4 lg:hidden flex justify-between px-4 items-center`}
      >
        {/* Menu Icon */}
        <button className="btn btn-ghost" onClick={toggleMenuDrawer} aria-label="Open Menu">
          <FiMenu className="h-6 w-6" />
        </button>

        {/* Logo */}
              {/* Logo */}
              <Link href="/">
          <Image
            src={theme === "light"
              ? "https://afwanimage.s3.us-east-1.amazonaws.com/afwan+svg-01(1).svg"
              : "https://afwanimage.s3.us-east-1.amazonaws.com/afwan+svg-02.svg"}
            alt="Logo"
            width={100}
            height={40}
            className="cursor-pointer"
          />
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button className="btn btn-ghost" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === "light" ? (
              <FiSun className="h-6 w-6 text-yellow-500" />
            ) : (
              <FiMoon className="h-6 w-6 text-white" />
            )}
          </button>

          {/* Notifications Icon */}
          <button
            id="notifications-button"
            className="btn btn-ghost btn-circle relative"
            onClick={toggleNotificationsDrawer}
            aria-label="Open Notifications"
          >
            <FiBell
              className={`h-6 w-6 ${
                theme === "light" ? "text-gray-800" : "text-gray-300"
              }`}
            />
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Drawer for Mobile and Tablet View */}
      <div
        ref={menuDrawerRef}
        className={`fixed top-0 left-0 h-full w-[80%] sm:w-[60%] md:w-[50%] lg:w-[30%] ${
          theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-100"
        } shadow-lg transform ${
          menuDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Drawer content here */}
        <div className="p-4">
          <button
            onClick={toggleMenuDrawer}
            className="text-lg mb-4 flex items-center"
            aria-label="Close Menu"
          >
            <FiX className="mr-2" />
            Close
          </button>
          <ul className="menu space-y-2">
            {/* Sidebar content here */}
            {productTypes.map((type) => (
              <li key={type._id} className="group">
                <Link
                  href={`/products/${type._id}`}
                  onClick={() => setMenuDrawerOpen(false)}
                >
                  <span>{type.types_name}</span>
                </Link>
                {/* Dropdown Menu */}
                {type.product_catagory.length > 0 && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {type.product_catagory.map((category) => (
                      <li key={category._id}>
                        <Link
                          href={`/products/${type._id}/${encodeURIComponent(
                            category.catagory_name
                          )}`}
                          onClick={() => setMenuDrawerOpen(false)}
                        >
                          <span>{category.catagory_name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Search Bar Drawer for Mobile and Tablet View */}
      {searchOpen && (
        <div
          className={`fixed top-0 left-0 w-full h-[70px] shadow-lg transform lg:hidden ${
            theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-100"
          } z-50`}
        >
          <div className="flex items-center justify-between p-4">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              className="input input-bordered w-full rounded-md"
            />
            <button onClick={toggleSearch} className="ml-2 text-lg" aria-label="Close Search">
              <FiX className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <div
        className={  `navbar px-4 md:px-10 lg:px-20 ${
          theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
        } py-4 hidden lg:flex`}
      >
        {/* Navbar Start */}
        <div className="navbar-start">
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-ghost btn-circle" aria-label="Open Dropdown Menu">
              <FiMenu
                className={`h-6 w-6 ${
                  theme === "light" ? "text-gray-800" : "text-gray-300"
                }`}
              />
            </button>
            <ul
              tabIndex={0}
              className={`menu menu-sm dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow ${
                theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-100"
              }`}
            >
              <li>
                <Link href="/">Homepage</Link>
              </li>
              <li>
                <Link href="/portfolio">Portfolio</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </div>
        </div>

               {/* Logo */}
               <Link href="/">
          <Image
            src={theme === "light"
              ? "https://afwanimage.s3.us-east-1.amazonaws.com/afwan+svg-01(1).svg"
              : "https://afwanimage.s3.us-east-1.amazonaws.com/afwan+svg-02.svg"}
            alt="Logo"
            width={100}
            height={30}
            className="cursor-pointer"
          />
        </Link>

        {/* Navbar End */}
        <div className="navbar-end flex items-center space-x-3 md:space-x-5">
          {/* Search Bar Toggle */}
          <div className="relative" ref={searchBarRef}>
            <button
              className="btn btn-ghost btn-circle"
              onClick={toggleSearch}
              aria-label="Open Search"
            >
              <FiSearch
                className={`h-5 w-5 md:h-6 md:w-6 ${
                  theme === "light" ? "text-gray-800" : "text-gray-300"
                }`}
              />
            </button>
            {searchOpen && (
              <div className="absolute right-0 mt-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className={`input input-bordered rounded-full w-full md:w-64 ${
                    theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-100"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Notifications Icon */}
          <button
            id="notifications-button"
            className="btn btn-ghost btn-circle relative"
            onClick={toggleNotificationsDrawer}
            aria-label="Open Notifications"
          >
            <FiBell
              className={`h-5 w-5 md:h-6 md:w-6 ${
                theme === "light" ? "text-gray-800" : "text-gray-300"
              }`}
            />
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            className="btn btn-ghost btn-circle"
            onClick={toggleCartDrawer}
            aria-label="Open Cart"
          >
            <div className="indicator">
              <FiShoppingCart
                className={`h-5 w-5 md:h-6 md:w-6 ${
                  theme === "light" ? "text-gray-800" : "text-gray-300"
                }`}
                style={{ strokeWidth: 2.5 }}
              />
              {totalQuantity > 0 && (
                <span className="badge badge-xs badge-primary indicator-item">
                  {totalQuantity}
                </span>
              )}
            </div>
          </button>

          {/* Theme Toggle */}
          <button className="btn btn-ghost" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === "light" ? (
              <FiSun className="h-6 w-6 text-yellow-500" />
            ) : (
              <FiMoon className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Bottom Navbar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 ${
          theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
        } lg:hidden flex justify-around items-center py-2 shadow-md`}
      >
        {/* Menu Icon */}
        <button className="btn btn-ghost" onClick={toggleMenuDrawer} aria-label="Open Menu">
          <FiMenu className="h-6 w-6" />
        </button>

        {/* Home Button */}
        <Link href="/">
          <button className="btn btn-ghost" aria-label="Home">
            <FiHome className="h-6 w-6" />
          </button>
        </Link>

        {/* Cart Icon */}
        <button className="btn btn-ghost" onClick={toggleCartDrawer} aria-label="Open Cart">
          <div className="indicator">
            <FiShoppingCart className="h-6 w-6" />
            {totalQuantity > 0 && (
              <span className="badge badge-xs badge-primary indicator-item">
                {totalQuantity}
              </span>
            )}
          </div>
        </button>

        {/* Search Icon */}
        <button className="btn btn-ghost" onClick={toggleSearch} aria-label="Open Search">
          <FiSearch className="h-6 w-6" />
        </button>
      </div>

      {/* Cart Drawer */}
      <div
        ref={cartDrawerRef}
        className={`fixed top-0 right-0 h-full w-[90%] sm:w-[60%] md:w-[50%] lg:w-[30%] shadow-2xl rounded-l-lg transform ${
          cartDrawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-100"
        }`}
      >
        <div className="flex justify-between items-center border-b dark:border-gray-700 p-4">
          <h2 className="text-lg mx-auto font-bold">Shopping Cart</h2>
          <button onClick={toggleCartDrawer} className="ml-auto text-lg" aria-label="Close Cart">
            <FiX className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium">Your cart is currently empty.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border-b pb-4"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  )}
                  <div className="flex-1 ml-4">
                    <div className="text-md">{item.name}</div>
                    {item.size && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Size: {item.size}
                      </div>
                    )}
                    {item.color && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Color: {item.color}
                      </div>
                    )}
                    {/* Quantity Selector */}
                    <div className="mt-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Quantity:
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          className={`px-2 py-1 bg-gray-200 rounded ${
                            item.quantity <= 1 ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.id, item.quantity - 1);
                              setToastMessage(`Decreased quantity of ${item.name}.`);
                              setToastType("success");
                              setToastVisible(true);
                            }
                          }}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span className="text-md font-medium">{item.quantity}</span>
                        <button
                          className="px-2 py-1 bg-gray-200 rounded"
                          onClick={() => {
                            // Assuming there's no max, or the max is enforced elsewhere
                            updateQuantity(item.id, item.quantity + 1);
                            setToastMessage(`Increased quantity of ${item.name}.`);
                            setToastType("success");
                            setToastVisible(true);
                          }}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-md font-bold">
                      Tk. {item.price * item.quantity}
                    </span>
                    <FiTrash2
                      className="text-red-500 cursor-pointer"
                      onClick={() => {
                        removeFromCart(item.id);
                        setToastMessage("Item removed from cart.");
                        setToastType("warning");
                        setToastVisible(true);
                      }}
                      aria-label={`Remove ${item.name} from cart`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-5 border-t dark:border-gray-700">
            <div className="flex justify-between mb-4">
              <span className="text-md font-semibold">Total</span>
              <span className="text-md font-semibold">Tk. {totalAmount}</span>
            </div>
            <Link href="/place-order">
              <button className="btn btn-gradient-blue w-full rounded-full py-3 text-md">
                Place Order
                <span className="ml-2 badge badge-secondary">{totalQuantity}</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default TopNavbar;
