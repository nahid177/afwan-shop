// src/app/products/[id]/page.tsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye } from "react-icons/fa"; // Icon for "See Details"
import { useTheme } from "@/mode/ThemeContext"; // Use the theme context
import { useCart } from "@/context/CartContext"; // Import the cart context
import Toast from "@/components/Toast/Toast"; // Import Toast component

interface Product {
  _id: string;
  product_name: string;
  offerPrice: number;
  originalPrice: number;
  images: string[];
  colors: { color: string }[];
  sizes: { size: string }[];
}

interface ProductCategory {
  _id: string;
  catagory_name: string;
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
  const { addToCart } = useCart(); // Use the cart context

  // Array of refs for auto-scrolling the product categories
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollIntervals = useRef<NodeJS.Timeout[]>([]); // Store intervals to clear later

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

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

  // Function to handle adding a product to the cart with selected size and color
  const handleAddToCart = (product: Product, selectedColor: string, selectedSize: string) => {
    const cartItem = {
      id: product._id,
      name: product.product_name,
      price: product.offerPrice || product.originalPrice,
      quantity: 1,
      imageUrl: product.images[0] || "/placeholder.png",
      color: selectedColor,
      size: selectedSize,
    };
    addToCart(cartItem);
    // Show toast notification
    setToastMessage("Product added to cart!");
    setToastType("success");
    setToastVisible(true);
  };

  return (
    <div
      className={`w-full mx-auto px-4 py-6 ${
        theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
      }`}
    >
      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            type={toastType}
            message={toastMessage}
            onClose={() => setToastVisible(false)}
          />
        </div>
      )}

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
        <div key={category._id} className="mb-8">
          {/* Category Name */}
          <h2 className="text-xl font-semibold mb-4">
            {category.catagory_name}
          </h2>

          {/* Horizontal Scrollable Product Row */}
          <div
            className="flex overflow-x-auto space-x-4 no-scrollbar"
            ref={(el) => {
              scrollRefs.current[index] = el;
            }}
          >
            {category.product.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                theme={theme}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ProductCard Component with Color and Size Selection
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string) => void;
  theme: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, theme }) => {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]?.size || "");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div
      className={`min-w-[200px] md:min-w-[250px] lg:min-w-[300px] border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
        theme === "light"
          ? "bg-white text-black"
          : "bg-gray-800 text-white"
      } relative`}
    >
      {/* Product Image */}
      <div className="mb-2">
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.product_name}
          width={300}
          height={300}
          className="w-full h-48 object-cover rounded transition-transform hover:scale-105"
        />
      </div>

      {/* Product Name */}
      <h3 className="text-base font-medium mb-2 text-center">
        {product.product_name}
      </h3>

      {/* Product Price */}
      <div className="mb-4 flex gap-3 justify-center">
        {product.offerPrice && (
          <span className="text-red-500 text-lg font-bold">
            Tk. {product.offerPrice.toFixed(0)}
          </span>
        )}
        {product.originalPrice &&
          product.originalPrice > product.offerPrice && (
            <span className="text-gray-500 line-through text-lg">
              Tk. {product.originalPrice.toFixed(0)}
            </span>
          )}
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-gradient-blue text-base w-full py-2 text-center rounded-lg hover:scale-105 transition-transform mb-4"
      >
        Add to Cart
      </button>

      {/* See Details Button with Icon */}
      <Link
        href={`/products/details/${product._id}`}
      >
        <button
          className={`flex items-center justify-center w-full text-base py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all ${
            theme === "light" ? "" : "bg-gray-700 text-white"
          }`}
        >
          <FaEye className="mr-2" />
          <span>See Details</span>
        </button>
      </Link>

      {/* Modal for Color and Size Selection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Select Options</h2>

            {/* Color Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Color:</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((colorItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(colorItem.color)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedColor === colorItem.color
                        ? "bg-blue-500 text-white"
                        : "bg-transparent text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {colorItem.color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Size:</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sizeItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(sizeItem.size)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedSize === sizeItem.size
                        ? "bg-green-500 text-white"
                        : "bg-transparent text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {sizeItem.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAddToCart(product, selectedColor, selectedSize);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTypePage;
