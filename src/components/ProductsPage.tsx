// src/components/ProductsPage.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";
import { useTheme } from "@/mode/ThemeContext";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/Toast/Toast";
import { IProductType } from "@/types";

const ProductsPage: React.FC = () => {
  const [productTypes, setProductTypes] = useState<IProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollIntervals = useRef<NodeJS.Timeout[]>([]);

  const triggerToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const stopAutoScroll = useCallback(() => {
    scrollIntervals.current.forEach((interval) => clearInterval(interval));
    scrollIntervals.current = [];
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();

    scrollRefs.current.forEach((ref, index) => {
      if (ref) {
        const scrollInterval = setInterval(() => {
          if (ref.scrollLeft + ref.offsetWidth >= ref.scrollWidth) {
            clearInterval(scrollInterval);
            ref.scrollLeft = 0; // Reset scroll position

            setTimeout(() => {
              startAutoScroll();
            }, 500); // Restart after reset
          } else {
            ref.scrollLeft += 1; // Move by 1px
          }
        }, 30 + index * 20); // Adjust speed per category
        scrollIntervals.current.push(scrollInterval);
      }
    });
  }, [stopAutoScroll]);

  const handleUserInteraction = useCallback(() => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get<IProductType[]>("/api/product-types");
        setProductTypes(response.data);
      } catch (error) {
        console.error("Error fetching product types:", error);
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  useEffect(() => {
    if (productTypes.length > 0) {
      startAutoScroll();
    }

    return () => {
      stopAutoScroll();
    };
  }, [productTypes, startAutoScroll, stopAutoScroll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto px-4 py-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      {toast && (
        <div className="fixed top-0 right-0 m-4 space-y-2 z-50">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {productTypes.length > 0 ? (
        productTypes.map((productType, typeIndex) => (
          <div key={productType._id} className="mb-8">
            <h2 className="text-2xl font-semibold text-center mb-4 relative">
              <span className="relative inline-block">
                {productType.types_name}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 transform scale-x-0 animation-underline transition-all duration-500 ease-in-out underline-offset-8" />
              </span>
            </h2>
            <div
              ref={(el) => { if (el) scrollRefs.current[typeIndex] = el; }}
              className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
              onMouseEnter={handleUserInteraction} // Pause on interaction
              onTouchStart={handleUserInteraction} // Pause on touch
            >
              {productType.product_catagory.map((category) => (
                <div key={category.catagory_name} className="flex flex-col">
                  <h3 className="text-xl font-medium mb-2 text-center">{category.catagory_name}</h3>
                  <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth">
                    {category.product.length > 0 ? (
                      category.product.map((product) => (
                        <ProductCard
                          key={product._id?.toString()} // Ensure _id is a string
                          product={product}
                          productType={productType}
                          category={category}
                          addToCart={addToCart}
                          triggerToast={triggerToast}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No products available in this category.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No product types available.</p>
      )}
    </div>
  );
};

export default ProductsPage;
