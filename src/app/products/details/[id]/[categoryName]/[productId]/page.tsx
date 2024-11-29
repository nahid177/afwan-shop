"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/mode/ThemeContext"; // Import the theme context
import { useCart } from "@/context/CartContext"; // Import the cart context
import Toast from "@/components/Toast/Toast"; // Import Toast component
import OtherProducts from "@/components/OtherProducts"; // Import the OtherProducts component
import { FaShareAlt } from "react-icons/fa"; // Import Share icon from react-icons
import Link from "next/link";
import ChatIcon from "@/components/ChatIcon";

interface ColorQuantity {
  color: string;
  quantity: number;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface Subtitle {
  title: string;
  titledetail: string;
}

interface Product {
  _id: string;
  product_name: string;
  code: string[];
  colors: ColorQuantity[];
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

const ProductDetailsPage: React.FC = () => {
  const { theme } = useTheme(); // Use the theme from the context
  const params = useParams();
  const productId = params.productId as string; // Extract productId from params
  const id = params.id as string; // Extract product type id
  const categoryName = params.categoryName as string; // Extract category name

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State to keep track of the selected image index
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  const { addToCart } = useCart();

  // States for selected color, size, and quantity
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Decode categoryName to prevent double encoding
        const decodedCategoryName = decodeURIComponent(categoryName);
        const encodedCategoryName = encodeURIComponent(decodedCategoryName);

        const productResponse = await axios.get(
          `/api/product-types/${id}/categories/${encodedCategoryName}/products/${productId}`
        );
        setProduct(productResponse.data);
        // Set default selected color and size
        if (productResponse.data.colors && productResponse.data.colors.length > 0) {
          setSelectedColor(productResponse.data.colors[0].color);
        }
        if (productResponse.data.sizes && productResponse.data.sizes.length > 0) {
          setSelectedSize(productResponse.data.sizes[0].size);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          // Handle Axios-specific errors
          console.error("Axios error:", error);
          setError(error.response?.data?.message || "Failed to fetch product details.");
        } else if (error instanceof Error) {
          // Handle generic errors
          console.error("Error:", error.message);
          setError(error.message);
        } else {
          // Handle unknown errors
          console.error("Unexpected error:", error);
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, id, categoryName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No product details found.</p>
      </div>
    );
  }

  // Function to handle adding a product to the cart with selected size, color, and quantity
  const handleAddToCart = () => {
    const cartItem = {
      id: product._id,
      name: product.product_name,
      price: product.offerPrice || product.originalPrice,
      quantity: quantity,
      imageUrl: product.images[0] || "/placeholder.png",
      color: selectedColor,
      size: selectedSize,
    };
    addToCart(cartItem);
    // Show toast notification
    setToastMessage("Product added to cart!");
    setToastType("success");
    setToastVisible(true);
    // Close the modal
    setIsModalOpen(false);
  };

  // Function to handle quantity increment
  const incrementQuantity = () => {
    if (product.sizes.length > 0) {
      const currentSize = product.sizes.find((s) => s.size === selectedSize);
      if (currentSize && quantity < currentSize.quantity) {
        setQuantity(quantity + 1);
      }
    }
  };

  // Function to handle quantity decrement
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Function to handle product share
  const handleShare = () => {
    const productUrl = window.location.href; // Get the current product URL
    if (navigator.share) {
      navigator.share({
        title: product.product_name,
        text: product.description,
        url: productUrl,
      }).catch(console.error);
    } else {
      // If the Share API is not supported, show an alert with the link
      navigator.clipboard.writeText(productUrl).then(() => {
        setToastMessage("Product link copied to clipboard!");
        setToastType("success");
        setToastVisible(true);
      });
    }
  };

  return (
    <div
    
      className={`w-full mx-auto px-4 py-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
    >
                  <ChatIcon />

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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Images */}
        <div className="lg:w-2/4">
          {/* Main Image */}
          <Image
            src={product.images[selectedImageIndex] || "/placeholder.png"}
            alt={product.product_name}
            width={800}
            height={800}
            className="object-cover rounded-lg"
          />
          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {product.images.map((image, index) => (
              <div key={index} className="cursor-pointer">
                <Image
                  src={image || "/placeholder.png"}
                  alt={`Product image ${index + 1}`}
                  width={100}
                  height={100}
                  className={`object-cover rounded-lg ${index === selectedImageIndex
                    ? "border-2 border-blue-500"
                    : "border"
                    }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-bold mb-4">{product.product_name}</h2>
          <p className="text-xl font-semibold text-red-500 mb-2">
            {product.offerPrice}৳{" "}
            <span className="line-through text-gray-500">
              {product.originalPrice}৳
            </span>
          </p>

          {/* Colors */}
          <p className="mb-4">
            <strong>Available Colors: </strong>
            {product.colors?.length > 0 ? (
              <span>
                {product.colors.map((colorItem) => colorItem.color).join(", ")}
              </span>
            ) : (
              <span>N/A</span>
            )}
          </p>

          {/* Sizes */}
          <p className="mb-4">
            <strong>Available Sizes: </strong>
            {product.sizes?.length > 0
              ? product.sizes.map((sizeItem, index) => (
                <span
                  key={index}
                  className="mr-2 text-sm px-2 py-1 border rounded-lg"
                >
                  {sizeItem.size} ({sizeItem.quantity} left)
                </span>
              ))
              : "N/A"}
          </p>

          {/* Actions */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-gradient-blue px-4 py-2 rounded-lg"
            >
              Add to Cart
            </button>
            <Link href={"/contactUs"}>
            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Chat With Admin
            </button>
            </Link>
           
          </div>

          {/* Share Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
            >
              <FaShareAlt size={20} />
              Share
            </button>
          </div>

          {/* Description */}
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="mb-4">{product.description}</p>

          {/* Titles */}
          {product.title?.length > 0 && (
            <div className="mb-4">
              <strong>Titles:</strong>
              <ul className="list-disc ml-4">
                {product.title.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Subtitles */}
          {product.subtitle?.length > 0 && (
            <div className="mb-4">
              <strong>Subtitles:</strong>
              <ul className="list-disc ml-4">
                {product.subtitle.map((subItem, index) => (
                  <li key={index}>
                    <strong>{subItem.title}</strong>: {subItem.titledetail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Color, Size, and Quantity Selection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 ${theme === "light" ? "text-black" : "text-white"
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
                    onClick={() => {
                      setSelectedColor(colorItem.color);
                      // Reset quantity to 1 when color changes
                      setQuantity(1);
                    }}
                    className={`px-3 py-1 rounded-full border ${selectedColor === colorItem.color
                      ? "bg-blue-500 text-white"
                      : "bg-transparent text-gray-700 dark:text-gray-300"
                      }`}
                    aria-pressed={selectedColor === colorItem.color}
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
                    onClick={() => {
                      setSelectedSize(sizeItem.size);
                      // Reset quantity to 1 when size changes
                      setQuantity(1);
                    }}
                    className={`px-3 py-1 rounded-full border ${selectedSize === sizeItem.size
                      ? "bg-green-500 text-white"
                      : "bg-transparent text-gray-700 dark:text-gray-300"
                      }`}
                    aria-pressed={selectedSize === sizeItem.size}
                  >
                    {sizeItem.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-4">
              <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                }`}
                >Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQuantity}
                  className={`px-3 py-1 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors ${theme === 'light' ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
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
                  className={`w-16 text-center border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${theme === 'light'
                    ? 'border-gray-400 bg-white text-gray-800'
                    : 'border-gray-600 bg-gray-800 text-gray-200'
                    }`}
                  min={1}
                  max={
                    product.sizes.find((s) => s.size === selectedSize)?.quantity || 1
                  }
                  aria-label="Product quantity"
                />
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                  disabled={
                    !selectedSize ||
                    quantity >=
                    (product.sizes.find((s) => s.size === selectedSize)?.quantity ||
                      1)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {selectedSize && (
                <p className={`text-sm mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  {`Max available: ${product.sizes.find((s) => s.size === selectedSize)?.quantity || 0
                    }`}
                </p>
              )}
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
                onClick={handleAddToCart}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!selectedColor || !selectedSize || quantity < 1 || product.sizes.find((size) => size.size === selectedSize)?.quantity === 0} // Disable if quantity is 0
                >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Other Products Section */}
      <OtherProducts categoryName={categoryName} id={id} />
    </div>
  );
};

export default ProductDetailsPage;
