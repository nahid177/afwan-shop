"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CiBookmarkCheck } from "react-icons/ci";
import { FiShoppingCart, FiSearch, FiMenu, FiSun, FiMoon, FiBell, FiTrash2, FiHome } from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/mode/ThemeContext";
import { usePathname } from "next/navigation";

const initialCartItems = [
  { id: 1, name: "Wireless Headphones", price: 120, quantity: 1, imageUrl: "" },
  { id: 2, name: "Smart Watch", price: 220, quantity: 2, imageUrl: "" },
];

const initialWishlistItems = [
  { id: 1, name: "Designer Edition Calligraphy T-Shirt", price: 450, originalPrice: 550, imageUrl: "" },
];

const TopNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [wishlistOpen, setWishlistOpen] = useState<boolean>(false);
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems);
  const [cartItems, setCartItems] = useState(initialCartItems);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const wishlistRef = useRef<HTMLDivElement | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);

  // Search toggle functionality
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    setDrawerOpen(false);
    setWishlistOpen(false);
  };

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Cart drawer toggle
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    setWishlistOpen(false);
    setSearchOpen(false);
  };

  // Wishlist drawer toggle
  const toggleWishlist = () => {
    setWishlistOpen(!wishlistOpen);
    setDrawerOpen(false);
    setSearchOpen(false);
  };

  // Close drawer or search bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (drawerRef.current && !drawerRef.current.contains(event.target as Node)) &&
        (wishlistRef.current && !wishlistRef.current.contains(event.target as Node)) &&
        (searchBarRef.current && !searchBarRef.current.contains(event.target as Node))
      ) {
        setDrawerOpen(false);
        setWishlistOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [drawerOpen, wishlistOpen, searchOpen]);

  // Calculate totals for cart
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Remove item from wishlist or cart
  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const isAdminPage = pathname.startsWith("/admin");

  // Render nothing if it's an admin page
  if (isAdminPage) return null;

  return (
    <>
      {/* Mobile Navbar */}
      <div className={`navbar ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"} py-4 md:hidden flex justify-between px-4 items-center`}>
        {/* Menu Icon */}
        <button className="btn btn-ghost">
          <FiMenu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <a className="text-lg font-bold">Afwan Shop</a>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button className="btn btn-ghost" onClick={toggleTheme}>
            {theme === "light" ? <FiSun className="h-6 w-6 text-yellow-500" /> : <FiMoon className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Search Bar Drawer for Mobile View */}
      {searchOpen && (
        <div className={`fixed top-0 left-0 w-full h-[70px] shadow-lg transform md:hidden ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"} z-50`}>
          <div className="flex items-center justify-between p-4">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
              className="input input-bordered w-full rounded-md"
            />
            <button onClick={toggleSearch} className="ml-2 text-lg">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <div className={`navbar px-4 md:px-10 lg:px-20 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"} py-4 hidden md:flex`}>
        {/* Navbar Start */}
        <div className="navbar-start">
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-ghost btn-circle">
              <FiMenu className={`h-6 w-6 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} />
            </button>
            <ul tabIndex={0} className={`menu menu-sm dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
              <li>
                <Link href="#">Homepage</Link>
              </li>
              <li>
                <Link href="#">Portfolio</Link>
              </li>
              <li>
                <Link href="#">About</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Navbar Center */}
        <div className="navbar-center">
          <a className="btn btn-ghost text-lg md:text-2xl font-bold">Afwan Shop</a>
        </div>

        {/* Navbar End */}
        <div className="navbar-end flex items-center space-x-3 md:space-x-5">
          {/* Search Bar Toggle */}
          <div className="relative" ref={searchBarRef}>
            <button className="btn btn-ghost btn-circle" onClick={toggleSearch}>
              <FiSearch className={`h-5 w-5 md:h-6 md:w-6 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} />
            </button>
            {searchOpen && (
              <div className="absolute right-0 mt-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className={`input input-bordered rounded-full w-full md:w-64 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}
                />
              </div>
            )}
          </div>

          {/* Notifications Icon */}
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <FiBell className={`h-5 w-5 md:h-6 md:w-6 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>

          {/* Wishlist Icon */}
          <button className="btn btn-ghost btn-circle" onClick={toggleWishlist}>
            <CiBookmarkCheck className={`h-5 w-5 md:h-6 md:w-6 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} style={{ strokeWidth: 0.9 }} />
          </button>

          {/* Cart Icon */}
          <button className="btn btn-ghost btn-circle" onClick={toggleDrawer}>
            <div className="indicator">
              <FiShoppingCart className={`h-5 w-5 md:h-6 md:w-6 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`} style={{ strokeWidth: 2.5 }} />
              {totalQuantity > 0 && <span className="badge badge-xs badge-primary indicator-item">{totalQuantity}</span>}
            </div>
          </button>

          {/* Theme Toggle */}
          <button className="btn btn-ghost" onClick={toggleTheme}>
            {theme === "light" ? <FiSun className="h-6 w-6 text-yellow-500" /> : <FiMoon className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Bottom Navbar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"} md:hidden flex justify-around items-center py-2 shadow-md`}>
        {/* Home Button */}
        <button className="btn btn-ghost">
          <FiHome className="h-6 w-6" />
        </button>

        {/* Wishlist Icon */}
        <button className="btn btn-ghost" onClick={toggleWishlist}>
          <CiBookmarkCheck className="h-6 w-6" />
        </button>

        {/* Cart Icon */}
        <button className="btn btn-ghost" onClick={toggleDrawer}>
          <div className="indicator">
            <FiShoppingCart className="h-6 w-6" />
            {totalQuantity > 0 && <span className="badge badge-xs badge-primary indicator-item">{totalQuantity}</span>}
          </div>
        </button>

        {/* Search Icon */}
        <button className="btn btn-ghost" onClick={toggleSearch}>
          <FiSearch className="h-6 w-6" />
        </button>

        {/* Theme Toggle */}
        <button className="btn btn-ghost" onClick={toggleTheme}>
          {theme === "light" ? <FiSun className="h-6 w-6 text-yellow-500" /> : <FiMoon className="h-6 w-6 text-white" />}
        </button>
      </div>

      {/* Cart Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-[90%] sm:w-[50%] md:w-[40%] lg:w-[30%] shadow-2xl rounded-l-lg transform ${drawerOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-50 flex flex-col ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}
      >
        <div className="flex justify-between items-center border-b dark:border-gray-700">
          <h2 className="text-lg mx-auto font-bold">Shopping Cart</h2>
          <button onClick={toggleDrawer} className="ml-auto text-lg">
            Close
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
                <li key={item.id} className="flex justify-between items-center border-b pb-4">
                  <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-lg object-cover" />
                  <div className="flex-1 ml-4">
                    <div className="text-md">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-md font-bold">${item.price * item.quantity}</span>
                    <FiTrash2 className="text-red-500 cursor-pointer" onClick={() => removeFromCart(item.id)} />
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
              <span className="text-md font-semibold">${totalAmount}</span>
            </div>
            <button className="btn btn-gradient-blue w-full rounded-full py-3 text-md">
              Place Order
              <span className="ml-2 badge badge-secondary">{totalQuantity}</span>
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Drawer */}
      <div
        ref={wishlistRef}
        className={`fixed top-0 right-0 h-full w-[90%] sm:w-[50%] md:w-[40%] lg:w-[30%] shadow-2xl rounded-l-lg transform ${wishlistOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-50 flex flex-col ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}
      >
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-bold mx-auto">Wish List Items</h2>
          <button onClick={toggleWishlist} className="ml-auto text-lg">
            Close
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium">Your wishlist is currently empty.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {wishlistItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center border-b pb-4">
                  <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-lg object-cover" />
                  <div className="flex-1 ml-4">
                    <div className="text-md">{item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="line-through">TK. {item.originalPrice}</span> TK. {item.price}
                    </div>
                    <button className="btn btn-gradient-blue w-full rounded-full mt-2">Add To Cart</button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiTrash2 className="text-red-500 cursor-pointer" onClick={() => removeFromWishlist(item.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default TopNavbar;
