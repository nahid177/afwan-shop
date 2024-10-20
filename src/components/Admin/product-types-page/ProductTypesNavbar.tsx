// src/components/Admin/product-types-page/ProductTypesNavbar.tsx

"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface IProductCategory {
  catagory_name: string; // Ensure this matches your backend field
  // Add other fields if necessary
}

interface IProductType {
  _id: string;
  types_name: string;
  product_catagory: IProductCategory[]; // Include categories
  // Add other fields if necessary
}

const ProductTypesNavbar: React.FC = () => {
  const [productTypes, setProductTypes] = useState<IProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDropdown, setOpenDropdown] = useState<{ [key: string]: boolean }>({});
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get<IProductType[]>("/api/product-types");
        setProductTypes(response.data);

        // Initialize all dropdowns as closed
        const initialDropdownState: { [key: string]: boolean } = {};
        response.data.forEach((type) => {
          initialDropdownState[type._id] = false;
        });
        setOpenDropdown(initialDropdownState);
      } catch (error) {
        console.error("Error fetching product types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        // Close all dropdowns
        setOpenDropdown({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id: string): void => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 shadow rounded-3xl" ref={navbarRef}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16">
          {/* Navigation links */}
          <div className="flex items-center space-x-4">
            {productTypes.map((type) => (
              <div key={type._id} className="relative">
                {/* Product Type Name as a Link */}
                <Link
                  href={`/admin/product-types/${type._id}`}
                  className="text-white hover:bg-white hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {type.types_name}
                </Link>

                {/* Dropdown Toggle Button */}
                {type.product_catagory.length > 0 && (
                  <button
                    onClick={() => toggleDropdown(type._id)}
                    className="ml-1 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={openDropdown[type._id]}
                  >
                    {openDropdown[type._id] ? (
                      <FiChevronUp className="text-white" />
                    ) : (
                      <FiChevronDown className="text-white" />
                    )}
                  </button>
                )}

                {/* Dropdown Menu */}
                {openDropdown[type._id] && type.product_catagory.length > 0 && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                    <ul className="py-1">
                      {type.product_catagory.map((category) => (
                        <li key={category.catagory_name}>
                          <Link
                            href={`/admin/product-types/${type._id}/${encodeURIComponent(
                              category.catagory_name
                            )}`}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            {category.catagory_name}
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
      </div>
    </nav>
  );
};

export default ProductTypesNavbar;
