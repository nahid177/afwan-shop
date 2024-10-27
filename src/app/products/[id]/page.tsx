"use client";
import React, { useEffect, useState, useRef } from "react";
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
  catagory_name: string; // Added this line
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

  // Array of refs for auto-scrolling the product categories
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollIntervals = useRef<NodeJS.Timeout[]>([]); // Store intervals to clear later

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

  // Function to start auto-scrolling
  const startAutoScroll = () => {
    scrollRefs.current.forEach((ref, index) => {
      if (ref) {
        const scrollInterval = setInterval(() => {
          // Check if the scroll has reached the end
          if (ref.scrollLeft + ref.offsetWidth >= ref.scrollWidth) {
            ref.scrollLeft = 0; // Reset the scroll to the beginning
          } else {
            ref.scrollLeft += 1; // Adjust the scroll speed here
          }
        }, 10 + index * 15); // Adjust the interval time to control smoothness/speed of scrolling

        scrollIntervals.current.push(scrollInterval); // Store the interval
      }
    });
  };

  // Function to stop auto-scrolling
  const stopAutoScroll = () => {
    scrollIntervals.current.forEach((interval) => clearInterval(interval));
    scrollIntervals.current = []; // Clear stored intervals
  };

  // Add event listeners to stop auto-scroll when user interacts with touch or mouse
  useEffect(() => {
    const handleUserInteraction = () => {
      stopAutoScroll(); // Stop scrolling when user interacts
    };

    // Capture the current value of scrollRefs in a variable
    const currentScrollRefs = scrollRefs.current;

    // Attach event listeners to each scrollable row
    currentScrollRefs.forEach((ref) => {
      if (ref) {
        ref.addEventListener("touchstart", handleUserInteraction); // Stop on touch
        ref.addEventListener("mousedown", handleUserInteraction); // Stop on mouse click
      }
    });

    // Cleanup event listeners on unmount
    return () => {
      currentScrollRefs.forEach((ref) => {
        if (ref) {
          ref.removeEventListener("touchstart", handleUserInteraction);
          ref.removeEventListener("mousedown", handleUserInteraction);
        }
      });
    };
  }, [productType]);

  // Start auto-scrolling when the component mounts or when `productType` changes
  useEffect(() => {
    startAutoScroll(); // Start auto-scroll initially

    // Cleanup intervals when the component unmounts
    return () => {
      stopAutoScroll();
    };
  }, [productType]);

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
    <div
      className={`w-full mx-auto px-4 py-6 ${
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
        <span className="font-bold">{productType.types_name}</span>
      </div>

      {/* Product Categories */}
      {productType.product_catagory.map((category, index) => (
        <div key={category._id}>
          <div
            className="flex overflow-x-auto space-x-8 mt-16 no-scrollbar"
            ref={(el) => {
              scrollRefs.current[index] = el; // Assign the ref without returning anything
            }}
          >
            {category.product.map((product) => (
              <div
                key={product._id}
                className={`min-w-[250px] md:min-w-[300px] lg:min-w-[300px] border lg:p-4 md:p-3 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                  theme === "light"
                    ? "bg-white text-black"
                    : "bg-gray-800 text-white"
                }`}
              >
                {/* Product Image */}
                <div className="mb-2">
                  <Image
                    src={product.images[0] || "/placeholder.png"}
                    alt={product.product_name}
                    width={300}
                    height={300}
                    className="lg:w-[300px] md:w-[300px] w-[300px] h-48 md:h-48 lg:h-48 object-cover rounded transition-transform hover:scale-105"
                  />
                </div>

                {/* Product Name */}
                <h3 className="text-xs md:text-base lg:text-xl font-medium mb-2 text-center">
                  {product.product_name}
                </h3>

                {/* Product Price */}
                <div className="lg:mb-6 md:mb-6 mb-1 flex gap-3 justify-center">
                  {product.offerPrice && (
                    <span className="text-red-500 text-xs md:text-base lg:text-xl font-bold">
                      {product.offerPrice.toFixed(2)}৳
                    </span>
                  )}
                  {product.originalPrice &&
                    product.originalPrice < product.offerPrice && (
                      <span className="text-gray-500 line-through text-xs md:text-base lg:text-xl">
                        {product.originalPrice.toFixed(2)}৳
                      </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button className="btn-gradient-blue text-xs md:text-base lg:text-xl w-full lg:py-3 md:py-3 py-1.5 text-center rounded-lg hover:scale-105 transition-transform mb-4">
                  Add to Cart
                </button>

                {/* See Details Button with Icon */}
                <Link
                  href={`/products/details/${id}/${category.catagory_name}/${product._id}`}
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductTypePage;
