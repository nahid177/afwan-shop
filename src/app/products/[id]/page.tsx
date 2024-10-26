"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye } from "react-icons/fa"; // Icon for "See Details"
import { useTheme } from "@/mode/ThemeContext"; // Use the theme context

interface Product {
  _id: string;
  product_name: string;
  offerPrice: number;
  originalPrice: number;
  images: string[];
}

interface ProductCategory {
  _id: string;
  product: Product[];
}

interface ProductType {
  _id: string;
  types_name: string;
  product_catagory: ProductCategory[];
}

const ProductTypePage: React.FC = () => {
  const { id } = useParams();
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme } = useTheme(); // Accessing theme for dynamic styling

  useEffect(() => {
    const fetchProductType = async () => {
      try {
        const response = await axios.get(`/api/product-types/${id}`);
        setProductType(response.data);
      } catch (error) {
        console.error("Error fetching product type:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductType();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!productType) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Product type not found.</p>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto px-4 py-6 ${theme === 'light' ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
      {/* Breadcrumb */}
      <div className={`mb-4 text-gray-600 ${theme === 'light' ? '' : 'text-gray-400'}`}>
        <Link href="/">
          <span className="hover:underline">Home</span>
        </Link>
        {" / "}
        <span className="font-bold">{productType.types_name}</span>
      </div>

      {/* Product Grid */}
      {productType.product_catagory.map((category) => (
        <div key={category._id}>
          <div className="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4 ls:gap-6 md:gap-5 gap-3 mt-10">
            {category.product.map((product) => (
              <div
                key={product._id}
                className={`border lg:p-4 md:p-3 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow ${theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
              >
                {/* Product Image */}
                <div className="mb-1">
                  <Image
                    src={product.images[0] || "/placeholder.png"}
                    alt={product.product_name}
                    width={300}
                    height={300}
                    className="w-full h-auto object-cover rounded transition-transform hover:scale-105"
                  />
                </div>

                {/* Product Name */}
                <h3 className="text-xs md:text-base lg:text-xl  font-medium mb-2 text-center">{product.product_name}</h3>

                {/* Product Price */}
                <div className=" lg:mb-6 md:mb-6 mb-1 flex gap-3">
                  {product.offerPrice && (
                    <span className="text-red-500 text-xs md:text-base lg:text-xl font-bold">
                      {product.offerPrice.toFixed(2)}৳
                    </span>
                  )}
                  {product.originalPrice && product.originalPrice < product.offerPrice && (
                    <div>
                      <span className="text-gray-500 line-through text-xs md:text-base lg:text-xl ">
                        {product.originalPrice.toFixed(2)}৳
                      </span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button className="btn-gradient-blue text-xs md:text-base lg:text-xl w-full py-3 text-center rounded-lg hover:scale-105 transition-transform mb-4 ">
                  Add to Cart
                </button>

                {/* See Details Button with Icon */}
                <Link href={`/products/details/${product._id}`}>
                  <button className={`flex items-center justify-center w-full text-xs md:text-base lg:text-xl py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all ${theme === 'light' ? '' : 'bg-gray-700 text-white'}`}>
                    <FaEye className="mr-2" />
                    <span>See Details</span>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductTypePage;
