"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye } from "react-icons/fa"; // Import icon for "See Details"
import { useTheme } from "@/mode/ThemeContext"; // Import the theme context

interface Subtitle {
  title: string;
  titledetail: string;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface Product {
  _id: string;
  product_name: string;
  code: string[];
  color: string[];
  sizes: SizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: Subtitle[];
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CategoryProductsPage: React.FC = () => {
  const { theme } = useTheme(); // Use the theme from the context
  const params = useParams();
  const id = params.id as string;
  const categoryName = params.categoryName as string;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeName, setTypeName] = useState<string>("");

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        // Fetch products
        const productResponse = await axios.get(
          `/api/product-types/${id}/categories/${categoryName}`
        );
        setProducts(productResponse.data);

        // Fetch type name using the id to display in breadcrumb
        const typeResponse = await axios.get(`/api/product-types/${id}`);
        setTypeName(typeResponse.data.types_name);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id, categoryName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full  mx-auto px-4 py-6 ${
        theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
      }`}
    >
      {/* Breadcrumb */}
      <div
        className={`mb-4 text-gray-600 ${
          theme === "light" ? "" : "text-gray-400"
        }`}
      >
        <Link href="/">
          <span className="hover:underline">Home</span>
        </Link>
        {" / "}
        <Link href={`/products/${id}`}>
          <span className="hover:underline">{typeName}</span>
        </Link>
        {" / "}
        <span className="font-bold">
          {decodeURIComponent(categoryName.replace(/-/g, " "))}
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 ls:gap-8 md:gap-5 gap-3 ">
        {products.map((product) => (
          <div
            key={product._id}
            className={`border lg:p-4 md:p-3 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
              theme === "light"
                ? "bg-white text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            {/* Product Image */}
            <div className="mb-1">
              <Image
                src={product.images[0] || "/placeholder.png"}
                alt={product.product_name}
                width={300}
                height={300}
                className="w-full h-32 md:h-60 lg:h-72 object-cover rounded transition-transform hover:scale-105"
              />
            </div>

            {/* Product Name */}
            <h3 className="text-xs md:text-base lg:text-xl  font-medium mb-2 text-center">
              {product.product_name}
            </h3>

            {/* Product Price */}
            <div className=" lg:mb-6 md:mb-6 mb-1 flex gap-3">
              {product.offerPrice && (
                <span className="text-red-500 text-xs md:text-base lg:text-xl font-bold">
                  {product.offerPrice.toFixed(2)}৳
                </span>
              )}
              {product.originalPrice &&
                product.originalPrice < product.offerPrice && (
                  <div>
                    <span className="text-gray-500 line-through text-xs md:text-base lg:text-xl ">
                      {product.originalPrice.toFixed(2)}৳
                    </span>
                  </div>
                )}
            </div>
            <div className="px-4 ">
              {/* Add to Cart Button */}
              <button className="btn-gradient-blue text-xs md:text-base lg:text-xl w-full lg:py-3 md:py-3 py-1.5 text-center rounded-lg hover:scale-105 transition-transform mb-4 ">
                Add to Cart
              </button>

              {/* See Details Button with Icon */}
              <Link
                href={`/products/details/${id}/${categoryName}/${product._id}`}
              >
                <button
                  className={`flex items-center justify-center w-full text-xs md:text-base lg:text-xl lg:py-3 md:py-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all ${
                    theme === "light" ? "" : "bg-gray-700 text-white"
                  }`}
                >
                  <FaEye className="mr-2" />
                  <span>See Details</span>
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
