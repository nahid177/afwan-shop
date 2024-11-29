// src/app/products/[id]/[categoryName]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye } from "react-icons/fa"; // Import icon for "See Details"
import { useTheme } from "@/mode/ThemeContext"; // Import the theme context
import { useCart } from "@/context/CartContext"; // Import the cart context
import Toast from "@/components/Toast/Toast"; // Import Toast component
import Footer from "@/components/Footer";
import ChatIcon from "@/components/ChatIcon";

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
  colors: { color: string }[];
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

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const productResponse = await axios.get(
          `/api/product-types/${id}/categories/${categoryName}`
        );
        setProducts(productResponse.data);

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

  // Function to handle adding a product to the cart with selected size, color, and quantity
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
    <div
      className={`w-full mx-auto px-4 py-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
    >
   <ChatIcon />

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
      <div className={`mb-4 text-gray-600 ${theme === "light" ? "" : "text-gray-400"}`}>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <CategoryProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart}
            theme={theme}
            categoryName={categoryName}
            productTypeId={id}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
};

// CategoryProductCard Component with Color, Size, and Quantity Selection
interface CategoryProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string, quantity: number) => void;
  theme: string;
  categoryName: string;
  productTypeId: string;
}

const CategoryProductCard: React.FC<CategoryProductCardProps> = ({
  product,
  onAddToCart,
  theme,
  categoryName,
  productTypeId,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]?.size || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Functions to increment and decrement quantity
  const incrementQuantity = () => {
    const maxQuantity = product.sizes.find((s) => s.size === selectedSize)?.quantity || 1;
    setQuantity((prevQuantity) => Math.min(prevQuantity + 1, maxQuantity));
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  return (
    <div
      className={`border lg:p-4 md:p-3 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow ${theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
        }  mb-10`}
    >
      <div className="mb-1">
        <Image
          src={product.images[0] || "/placeholder.png"}
          alt={product.product_name}
          width={300}
          height={300}
          className="w-full h-28 md:h-60 lg:h-72 object-cover rounded transition-transform hover:scale-105"
        />
      </div>

      <h3 className="text-xs md:text-base lg:text-xl font-medium mb-2 text-center">
        {product.product_name}
      </h3>

      <div className="lg:mb-6 md:mb-6 mb-1 flex gap-3 justify-center">
        {product.offerPrice && (
          <span className="text-red-500 text-xs md:text-base lg:text-xl font-bold">
            {product.offerPrice.toFixed(0)}৳
          </span>
        )}
        {product.originalPrice &&
          product.originalPrice > product.offerPrice && (
            <span className="text-gray-500 line-through text-xs md:text-base lg:text-xl">
              {product.originalPrice.toFixed(0)}৳
            </span>
          )}
      </div>

      <div className="px-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gradient-blue text-xs md:text-base lg:text-xl w-full py-2 text-center rounded-lg hover:scale-105 transition-transform mb-4"
        >
          Add to Cart
        </button>

        <Link
          href={`/products/details/${productTypeId}/${encodeURIComponent(
            categoryName
          )}/${product._id}`}
        >
          <button
            className={`flex items-center justify-center w-full text-xs md:text-base lg:text-xl lg:py-3 md:py-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all ${theme === "light" ? "" : "bg-gray-700 text-white"
              }`}
          >
            <FaEye className="mr-2" />
            <span>See Details</span>
          </button>
        </Link>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 ${theme === "light" ? "text-black" : "text-white"
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
                    className={`px-3 py-1 rounded-full border ${selectedColor === colorItem.color
                        ? "bg-blue-500 text-white"
                        : "bg-transparent text-gray-700 dark:text-gray-300"
                      }`}
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
                    className={`px-3 py-1 rounded-full border ${selectedSize === sizeItem.size
                        ? "bg-green-500 text-white"
                        : "bg-transparent text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {sizeItem.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                Quantity:
              </label>
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
                  disabled={
                    quantity >= (product.sizes.find((s) => s.size === selectedSize)?.quantity || 1)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {selectedSize && (
                <p className={`text-sm mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Max available: {product.sizes.find((s) => s.size === selectedSize)?.quantity || 0}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAddToCart(product, selectedColor, selectedSize, quantity);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!selectedColor || !selectedSize || quantity < 1 || product.sizes.find((size) => size.size === selectedSize)?.quantity === 0} // Disable if quantity is 0
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

export default CategoryProductsPage;
