// components/ButtomNavbar.tsx

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // Get the current path

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

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Check if the current page is an admin page
  const isAdminPage = pathname.startsWith("/admin");

  // Return nothing if it's an admin page
  if (isAdminPage) return null;

  return (
    <nav className="w-full bg-white text-black dark:bg-gray-900 dark:text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center flex-col md:flex-row">
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          {productTypes.map((type) => (
            <div key={type._id} className="group relative">
              <Link href={`/products/${type._id}`}>
                <h2 className="font-medium hover:text-blue-500 cursor-pointer">
                  {type.types_name}
                </h2>
              </Link>
              {/* Dropdown Menu */}
              {type.product_catagory.length > 0 && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

        {/* Mobile Menu Button */}
        <div className="md:hidden absolute right-4 top-4">
          <button onClick={toggleMenu}>
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900">
          <ul className="space-y-2 px-4 py-2">
            {productTypes.map((type) => (
              <li key={type._id}>
                <details>
                  <summary className="font-medium cursor-pointer">
                    <Link href={`/products/${type._id}`}>
                      <h2>{type.types_name}</h2>
                    </Link>
                  </summary>
                  <ul className="pl-4">
                    {type.product_catagory.map((category) => (
                      <li key={category._id}>
                        <Link
                          href={`/products/${type._id}/${encodeURIComponent(
                            category.catagory_name
                          )}`}
                        >
                          <h2 className="block py-1 cursor-pointer">
                            {category.catagory_name}
                          </h2>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default ButtomNavbar;
