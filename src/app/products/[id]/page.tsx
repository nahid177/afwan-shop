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

// Define interfaces for type safety
interface Product {
  _id: string;
  product_name: string;
  offerPrice: number;
  originalPrice: number;
  images: string[];
  colors: { color: string }[];
  sizes: { size: string; quantity: number }[];
}

interface ProductCategory {
  _id: string;
  catagory_name: string; // Reverted to original name
  product: Product[];
}

interface ProductType {
  _id: string;
  types_name: string;
  product_catagory: ProductCategory[]; // Reverted to original name
}

const ProductTypePage: React.FC = () => {
  const params = useParams();
  const idParam = params.id;
  const typeId = Array.isArray(idParam) ? idParam[0] : idParam; // Ensure typeId is string

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
        const response = await axios.get(`/api/product-types/${typeId}`);
        setProductType(response.data);
      } catch (error: unknown) {
        console.error("Error fetching product type:", error);
        setToastMessage("Failed to load product types.");
        setToastType("error");
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductType();
  }, [typeId]);

  const startAutoScroll = () => {
    scrollRefs.current.forEach((ref, index) => {
      if (ref) {
        const scrollInterval = setInterval(() => {
          if (ref.scrollLeft + ref.offsetWidth >= ref.scrollWidth) {
            ref.scrollLeft = 0;
          } else {
            ref.scrollLeft += 1;
          }
        }, 10 + index * 15);
        scrollIntervals.current.push(scrollInterval);
      }
    });
  };

  const stopAutoScroll = () => {
    scrollIntervals.current.forEach((interval) => clearInterval(interval));
    scrollIntervals.current = [];
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      stopAutoScroll();
    };

    const currentScrollRefs = scrollRefs.current;

    currentScrollRefs.forEach((ref) => {
      if (ref) {
        ref.addEventListener("touchstart", handleUserInteraction);
        ref.addEventListener("mousedown", handleUserInteraction);
      }
    });

    return () => {
      currentScrollRefs.forEach((ref) => {
        if (ref) {
          ref.removeEventListener("touchstart", handleUserInteraction);
          ref.removeEventListener("mousedown", handleUserInteraction);
        }
      });
    };
  }, [productType]);

  useEffect(() => {
    if (productType) {
      startAutoScroll();
    }

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

  const handleAddToCart = (product: Product, selectedColor: string, selectedSize: string, quantity: number) => {
    const cartItem = {
      id: product._id,
      name: product.product_name,
      price: product.offerPrice || product.originalPrice,
      quantity,
      imageUrl: product.images[0] || "/placeholder.png",
      color: selectedColor,
      size: selectedSize,
    };
    addToCart(cartItem);
    setToastMessage("Product added to cart!");
    setToastType("success");
    setToastVisible(true);
  };

  return (
    <div className={`w-full mx-auto px-4 py-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      {toastVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast type={toastType} message={toastMessage} onClose={() => setToastVisible(false)} />
        </div>
      )}

      <div className={`mb-4 text-gray-600 ${theme === "light" ? "" : "text-gray-400"}`}>
        <Link href="/">
          <span className="hover:underline">Home</span>
        </Link>
        {" / "}
        <span className="font-bold">{productType.types_name}</span>
      </div>

      {productType.product_catagory && productType.product_catagory.length > 0 ? (
        productType.product_catagory.map((category, index) => (
          <div key={category._id} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{category.catagory_name}</h2>
            <div
              className="flex overflow-x-auto space-x-4 no-scrollbar"
              ref={(el) => {
                scrollRefs.current[index] = el;
              }}
            >
              {category.product.length > 0 ? (
                category.product.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    theme={theme}
                    categoryName={category.catagory_name}
                    typeId={typeId}
                  />
                ))
              ) : (
                <p className="text-gray-500">No products found in this category.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No product categories available.</p>
      )}
    </div>
  );
};

// ProductCard Component with Color, Size, and Quantity Selection
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string, quantity: number) => void;
  theme: string;
  categoryName: string;
  typeId: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, theme, categoryName, typeId }) => {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]?.size || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const incrementQuantity = () => {
    const maxQuantity = product.sizes.find((s) => s.size === selectedSize)?.quantity || 1;
    setQuantity((prevQuantity) => Math.min(prevQuantity + 1, maxQuantity));
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  return (
    <div
      className={`min-w-[200px] md:min-w-[250px] lg:min-w-[300px] border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
        theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
      } relative`}
    >
      <div className="mb-2">
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.product_name}
          width={300}
          height={300}
          className="w-full h-48 object-cover rounded transition-transform hover:scale-105"
          loading="lazy"
        />
      </div>

      <h3 className="text-base font-medium mb-2 text-center">{product.product_name}</h3>

      <div className="mb-4 flex gap-3 justify-center">
        {product.offerPrice && <span className="text-red-500 text-lg font-bold">{product.offerPrice.toFixed(0)}৳</span>}
        {product.originalPrice && product.originalPrice < product.offerPrice && (
          <span className="text-gray-500 line-through text-lg">{product.originalPrice.toFixed(0)}৳</span>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-gradient-blue text-base w-full py-2 text-center rounded-lg hover:scale-105 transition-transform mb-4"
      >
        Add to Cart
      </button>

      <Link href={`/products/details/${typeId}/${categoryName}/${product._id}`}>
        <button
          className={`flex items-center justify-center w-full text-xs md:text-base lg:text-xl lg:py-3 md:py-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all ${
            theme === "light" ? "" : "bg-gray-700 text-white"
          }`}
          aria-label={`See details of ${product.product_name}`}
        >
          <FaEye className="mr-2" />
          <span>See Details</span>
        </button>
      </Link>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Select Options</h2>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Color:</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((colorItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(colorItem.color)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedColor === colorItem.color ? "bg-blue-500 text-white" : "bg-transparent text-gray-700 dark:text-gray-300"
                    }`}
                    aria-pressed={selectedColor === colorItem.color}
                  >
                    {colorItem.color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Size:</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sizeItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(sizeItem.size)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedSize === sizeItem.size ? "bg-green-500 text-white" : "bg-transparent text-gray-700 dark:text-gray-300"
                    }`}
                    aria-pressed={selectedSize === sizeItem.size}
                  >
                    {sizeItem.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQuantity}
                  className={`px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      const currentSize = product.sizes.find((s) => s.size === selectedSize);
                      const maxQuantity = currentSize ? currentSize.quantity : 1;
                      setQuantity(val > maxQuantity ? maxQuantity : val);
                    }
                  }}
                  className={`w-16 text-center border rounded-lg px-2 py-1 ${theme === 'light' ? 'border-gray-400 bg-white text-gray-800' : 'border-gray-600 bg-gray-800 text-gray-200'}`}
                  min={1}
                  max={product.sizes.find((s) => s.size === selectedSize)?.quantity || 1}
                  aria-label="Product quantity"
                />
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
                  disabled={quantity >= (product.sizes.find((s) => s.size === selectedSize)?.quantity || 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {selectedSize && (
                <p className={`text-sm mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Max available: {product.sizes.find((s) => s.size === selectedSize)?.quantity || 1}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={() => {
                  onAddToCart(product, selectedColor, selectedSize, quantity);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!selectedColor || !selectedSize || quantity < 1}
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
