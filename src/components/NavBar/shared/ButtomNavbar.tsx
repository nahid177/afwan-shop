// src/components/NavBar/shared/ButtomNavbar.tsx

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";

interface ProductCategory {
  _id: string;
  catagory_name: string;
}

interface ProductType {
  _id: string;
  types_name: string;
  product_catagory: ProductCategory[];
}

interface ButtomNavbarProps {
  productTypes: ProductType[];
}

const ButtomNavbar: React.FC<ButtomNavbarProps> = ({ productTypes = [] }) => {
  const pathname = usePathname(); // Get the current path
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0); // Check if user scrolled
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup on unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Skip rendering if it's an admin page
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className={`${
        isScrolled ? "fixed top-0 w-full" : "relative"
      } bg-white hidden lg:block text-black dark:bg-gray-900 dark:text-white transition-all`}
      aria-label="Primary Navigation"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-col">
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

// Server-side function to fetch product types before rendering the page using axios
export async function getServerSideProps() {
  try {
    const response = await axios.get(`/api/product-types`);
    const productTypes: ProductType[] = response.data || []; // Fallback to empty array if data is undefined

    return {
      props: { productTypes },
    };
  } catch (error) {
    console.error("Error fetching product types:", error);
    return {
      props: { productTypes: [] }, // Provide fallback if error occurs
    };
  }
}

export default ButtomNavbar;
