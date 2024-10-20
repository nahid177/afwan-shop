// src/components/Admin/product-types-page/ProductTypesNavbar.tsx

"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface IProductType {
  _id: string;
  types_name: string;
  // Add other fields if necessary
}

const ProductTypesNavbar: React.FC = () => {
  const [productTypes, setProductTypes] = useState<IProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get("/api/product-types");
        setProductTypes(response.data);
      } catch (error) {
        console.error("Error fetching product types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 shadow rounded-3xl">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-center h-16">
          {/* Navigation links */}
          <div className="flex items-center space-x-4">
            {productTypes.map((type) => (
              <Link
                key={type._id}
                href={`/admin/product-types/${type._id}`}
                className="text-white hover:bg-white hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {type.types_name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ProductTypesNavbar;
