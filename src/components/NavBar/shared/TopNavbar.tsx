// src/components/NavBar/shared/TopNavbar.tsx

"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { CiBookmarkCheck } from "react-icons/ci";
import {
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiSun,
  FiMoon,
  FiBell,
  FiTrash2,
  FiHome,
} from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/mode/ThemeContext";
import { usePathname } from "next/navigation";
import axios from "axios";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
}

interface ProductCategory {
  _id: string;
  catagory_name: string;
}

interface ProductType {
  _id: string;
  types_name: string;
  product_catagory: ProductCategory[];
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 120,
    quantity: 1,
    imageUrl: "",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 220,
    quantity: 2,
    imageUrl: "",
  },
];

const initialWishlistItems: WishlistItem[] = [
  {
    id: 1,
    name: "Designer Edition Calligraphy T-Shirt",
    price: 450,
    originalPrice: 550,
    imageUrl: "",
  },
];

const TopNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Separate state variables for each drawer
  const [menuDrawerOpen, setMenuDrawerOpen] = useState<boolean>(false); // For mobile and tablet menu drawer
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false); // For cart drawer
  const [wishlistOpen, setWishlistOpen] = useState<boolean>(false);

  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>(initialWishlistItems);
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Separate refs for each drawer
  const menuDrawerRef = useRef<HTMLDivElement | null>(null); // For mobile and tablet menu drawer
  const cartDrawerRef = useRef<HTMLDivElement | null>(null); // For cart drawer
  const wishlistRef = useRef<HTMLDivElement | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);

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

  // Search toggle functionality
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // Close other drawers
    setMenuDrawerOpen(false);
    setWishlistOpen(false);
    setCartDrawerOpen(false);
  };

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Toggle functions for each drawer
  const toggleMenuDrawer = () => {
    setMenuDrawerOpen(!menuDrawerOpen);
    setWishlistOpen(false);
    setSearchOpen(false);
    setCartDrawerOpen(false);
  };

  const toggleCartDrawer = () => {
    setCartDrawerOpen(!cartDrawerOpen);
    setWishlistOpen(false);
    setSearchOpen(false);
    setMenuDrawerOpen(false);
  };

  const toggleWishlist = () => {
    setWishlistOpen(!wishlistOpen);
    setMenuDrawerOpen(false);
    setSearchOpen(false);
    setCartDrawerOpen(false);
  };

  // Close drawers and modals when clicking outside
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
        wishlistRef.current &&
        !wishlistRef.current.contains(event.target as Node) &&
        wishlistOpen
      ) {
        setWishlistOpen(false);
      }
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        searchOpen
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuDrawerOpen, cartDrawerOpen, wishlistOpen, searchOpen]);

  // Calculate totals for cart
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
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
      {/* Mobile and Tablet Navbar */}
      <div
        className={`navbar ${
          theme === "light"
            ? "bg-gray-50 text-gray-900"
            : "bg-gray-800 text-gray-100"
        } py-4 lg:hidden flex justify-between px-4 items-center`}
      >
        {/* Menu Icon */}
        <button className="btn btn-ghost" onClick={toggleMenuDrawer}>
          <FiMenu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <Link href="/">
          <span className="text-lg font-bold cursor-pointer">Afwan Shop</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button className="btn btn-ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <FiSun className="h-6 w-6 text-yellow-500" />
            ) : (
              <FiMoon className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Drawer for Mobile and Tablet View */}
      <div
        ref={menuDrawerRef}
        className={`fixed top-0 left-0 h-full w-[80%] sm:w-[60%] md:w-[50%] lg:w-[30%] ${
          theme === "light"
            ? "bg-white text-gray-900"
            : "bg-gray-800 text-gray-100"
        } shadow-lg transform ${
          menuDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Drawer content here */}
        <div className="p-4">
          <button
            onClick={toggleMenuDrawer}
            className="text-lg mb-4 flex items-center"
          >
            <FiMenu className="mr-2" />
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
            theme === "light"
              ? "bg-white text-gray-900"
              : "bg-gray-800 text-gray-100"
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
            <button onClick={toggleSearch} className="ml-2 text-lg">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <div
        className={`navbar px-4 md:px-10 lg:px-20 ${
          theme === "light"
            ? "bg-gray-50 text-gray-900"
            : "bg-gray-800 text-gray-100"
        } py-4 hidden lg:flex`}
      >
        {/* Navbar Start */}
        <div className="navbar-start">
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-ghost btn-circle">
              <FiMenu
                className={`h-6 w-6 ${
                  theme === "light" ? "text-gray-800" : "text-gray-300"
                }`}
              />
            </button>
            <ul
              tabIndex={0}
              className={`menu menu-sm dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow ${
                theme === "light"
                  ? "bg-white text-gray-900"
                  : "bg-gray-800 text-gray-100"
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

        {/* Navbar Center */}
        <div className="navbar-center">
          <Link href="/">
            <span className="btn btn-ghost text-lg md:text-2xl font-bold cursor-pointer">
              Afwan Shop
            </span>
          </Link>
        </div>

        {/* Navbar End */}
        <div className="navbar-end flex items-center space-x-3 md:space-x-5">
          {/* Search Bar Toggle */}
          <div className="relative" ref={searchBarRef}>
            <button
              className="btn btn-ghost btn-circle"
              onClick={toggleSearch}
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
                    theme === "light"
                      ? "bg-white text-gray-900"
                      : "bg-gray-800 text-gray-100"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Notifications Icon */}
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <FiBell
                className={`h-5 w-5 md:h-6 md:w-6 ${
                  theme === "light" ? "text-gray-800" : "text-gray-300"
                }`}
              />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>

          {/* Wishlist Icon */}
          <button
            className="btn btn-ghost btn-circle"
            onClick={toggleWishlist}
          >
            <CiBookmarkCheck
              className={`h-5 w-5 md:h-6 md:w-6 ${
                theme === "light" ? "text-gray-800" : "text-gray-300"
              }`}
              style={{ strokeWidth: 0.9 }}
            />
          </button>

          {/* Cart Icon */}
          <button className="btn btn-ghost btn-circle" onClick={toggleCartDrawer}>
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
          <button className="btn btn-ghost" onClick={toggleTheme}>
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
          theme === "light"
            ? "bg-gray-50 text-gray-900"
            : "bg-gray-800 text-gray-100"
        } lg:hidden flex justify-around items-center py-2 shadow-md`}
      >
        {/* Menu Icon */}
        <button className="btn btn-ghost" onClick={toggleMenuDrawer}>
          <FiMenu className="h-6 w-6" />
        </button>

        {/* Home Button */}
        <Link href="/">
          <button className="btn btn-ghost">
            <FiHome className="h-6 w-6" />
          </button>
        </Link>

        {/* Wishlist Icon */}
        <button className="btn btn-ghost" onClick={toggleWishlist}>
          <CiBookmarkCheck className="h-6 w-6" />
        </button>

        {/* Cart Icon */}
        <button className="btn btn-ghost" onClick={toggleCartDrawer}>
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
        <button className="btn btn-ghost" onClick={toggleSearch}>
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
          <button onClick={toggleCartDrawer} className="ml-auto text-lg">
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
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      x{item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-md font-bold">
                      ${item.price * item.quantity}
                    </span>
                    <FiTrash2
                      className="text-red-500 cursor-pointer"
                      onClick={() => removeFromCart(item.id)}
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
        className={`fixed top-0 right-0 h-full w-[90%] sm:w-[60%] md:w-[50%] lg:w-[30%] shadow-2xl rounded-l-lg transform ${
          wishlistOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-100"
        }`}
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
              <p className="text-lg font-medium">
                Your wishlist is currently empty.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {wishlistItems.map((item) => (
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
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="line-through">
                        TK. {item.originalPrice}
                      </span>{" "}
                      TK. {item.price}
                    </div>
                    <button className="btn btn-gradient-blue w-full rounded-full mt-2">
                      Add To Cart
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiTrash2
                      className="text-red-500 cursor-pointer"
                      onClick={() => removeFromWishlist(item.id)}
                    />
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
