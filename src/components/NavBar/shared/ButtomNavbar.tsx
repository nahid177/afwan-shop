// src/components/NavBar/shared/ButtomNavbar.tsx

"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { usePathname } from "next/navigation";

interface ProductCategory {
  _id: string;
  catagory_name: string;
}

interface ProductType {
  _id: string;
  types_name: string;
  product_catagory: ProductCategory[];
}

const ButtomNavbar: React.FC = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const pathname = usePathname(); // Get the current path
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true); // If scrolled down
      } else {
        setIsScrolled(false); // If at the top
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
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

  // Check if the current page is an admin page
  const isAdminPage = pathname.startsWith("/admin");

  // Return nothing if it's an admin page
  if (isAdminPage) return null;

  return (
    <nav
      ref={navRef}
      className={`${isScrolled ? 'fixed top-0 w-full' : 'relative'
        } bg-white hidden lg:block text-black dark:bg-gray-900 dark:text-white transition-all`}
      aria-label="Primary Navigation"
    >      <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-col">
        {/* Desktop Menu */}
        <div className="flex space-x-6 items-center">
          <Link href={"/"}>
            <div className="font-medium hover:text-blue-500 cursor-pointer">Home</div>
          </Link>
          {productTypes.map((type) => (
            <div key={type._id} className="relative group">
              <Link href={`/products/${type._id}`}>
                <h2 className="font-medium hover:text-blue-500 cursor-pointer">
                  {type.types_name}
                </h2>
              </Link>
              {/* Dropdown Menu */}
              {type.product_catagory.length > 0 && (
                <div className="absolute hidden w-48 group-hover:flex flex-col mt-0 shadow-lg rounded-lg bg-white p-2 space-y-1">
                  <ul className="py-2">
                    {type.product_catagory.map((category) => (
                      <li key={category._id}>
                        <Link
                          href={`/products/${type._id}/${encodeURIComponent(
                            category.catagory_name
                          )}`}
                        >
                          <h2 className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                            {category.catagory_name}
                          </h2>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ButtomNavbar;
