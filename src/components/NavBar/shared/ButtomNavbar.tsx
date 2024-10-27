// src/components/NavBar/shared/ButtomNavbar.tsx

"use client";
import React, { useEffect, useState } from "react";
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
    <nav className="w-full bg-white text-black dark:bg-gray-900 dark:text-white shadow-md hidden lg:block ">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-col">
        {/* Desktop Menu */}
        <div className="flex space-x-6 items-center">
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
      </div>
    </nav>
  );
};

export default ButtomNavbar;
