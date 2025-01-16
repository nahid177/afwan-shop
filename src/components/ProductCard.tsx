// src/components/ProductCard.tsx

import React, { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/mode/ThemeContext";
import { CartItem, IProduct, IProductType, IProductCategory } from "@/types";
import { FiXCircle, FiShoppingCart, FiCheckCircle } from "react-icons/fi";

interface ProductCardProps {
  product: IProduct;
  productType: IProductType;
  category: IProductCategory;
  addToCart: (product: CartItem) => void;
  triggerToast: (message: string, type: "success" | "error" | "warning") => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  addToCart,
  triggerToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0]?.size || "");
  const [quantity, setQuantity] = useState<number>(1);
  const { theme } = useTheme();

  // Increase and decrease quantity functions
  const incrementQuantity = () => {
    const maxQuantity = product.sizes?.find((size) => size.size === selectedSize)?.quantity || 0;
    if (quantity < maxQuantity) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  // Handler for Add to Cart (from the modal)
  const handleAddToCartClick = () => {
    const cartItem: CartItem = {
      id: product._id!.toString(),
      name: product.product_name,
      price: product.offerPrice || product.originalPrice,
      buyingPrice: product.buyingPrice,
      quantity,
      imageUrl: product.images[0] || "/placeholder.png",
      color: selectedColor,
      size: selectedSize,
      code: product.code,
    };
    addToCart(cartItem);
    setIsModalOpen(false);
    triggerToast(`${product.product_name} has been added to the cart!`, "success");
  };

  // Handler for Buy Now (from the modal)
  const handleBuyNowClick = () => {
    const cartItem: CartItem = {
      id: product._id!.toString(),
      name: product.product_name,
      price: product.offerPrice || product.originalPrice,
      buyingPrice: product.buyingPrice,
      quantity,
      imageUrl: product.images[0] || "/placeholder.png",
      color: selectedColor,
      size: selectedSize,
      code: product.code,
    };
    addToCart(cartItem);
    setIsModalOpen(false);
    triggerToast(`${product.product_name} has been added! Redirecting to order.`, "success");
    window.location.href = "/place-order";
  };

  return (
    <div className="min-w-[200px] md:min-w-[250px] lg:min-w-[300px] border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <Image
        src={product.images[0] || "/placeholder.png"}
        alt={product.product_name}
        width={300}
        height={300}
        className="w-full h-48 object-cover rounded transition-transform hover:scale-105"
        priority={true}
      />
      <h3 className="text-xs font-medium mt-2 text-center">{product.product_name}</h3>
      <div className="mb-2 flex justify-center gap-2">
        {product.offerPrice && (
          <span className="text-red-500 text-base font-bold">{product.offerPrice.toFixed(0)}৳</span>
        )}
        {product.originalPrice && product.originalPrice > product.offerPrice && (
          <span className="text-gray-500 line-through text-base">
            {product.originalPrice.toFixed(0)}৳
          </span>
        )}
      </div>
       <button
        onClick={() => setIsModalOpen(true)}
        className="btn-gradient-blue flex items-center text-xs justify-center w-full py-2 px-4 rounded-lg transition-transform hover:scale-105 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FiShoppingCart className="mr-2" />
        Buy Now
      </button>

      {/* Modal for selecting options */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 ${theme === "light" ? "text-black" : "text-white"}`}
          >
            <h2 className="text-xl font-semibold mb-4">Select Options</h2>

            {/* Color Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Color:</label>
              <div className="flex flex-wrap gap-2">
                {product.colors?.map((colorItem, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedColor(colorItem.color);
                      setQuantity(1); // Reset quantity if color changes
                    }}
                    className={`px-3 py-1 rounded-full border ${
                      selectedColor === colorItem.color
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
                {product.sizes?.map((sizeItem, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedSize(sizeItem.size);
                      setQuantity(1); // Reset quantity if size changes
                    }}
                    className={`px-3 py-1 rounded-full border ${
                      selectedSize === sizeItem.size
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
              <label className="block mb-2 font-medium">Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQuantity}
                  className={`px-3 py-1 rounded-lg ${theme === 'light' ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-700 hover:bg-gray-600'} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                      const currentSize = product.sizes?.find((s) => s.size === selectedSize);
                      const maxQuantity = currentSize ? currentSize.quantity : 1;
                      setQuantity(val > maxQuantity ? maxQuantity : val);
                    }
                  }}
                  className={`w-16 text-center border rounded-lg px-2 py-1 transition-colors ${
                    theme === 'light' ? 'border-gray-400 bg-white text-gray-800' : 'border-gray-600 bg-gray-800 text-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  min={1}
                  max={product.sizes?.find((s) => s.size === selectedSize)?.quantity || 1}
                  aria-label="Product quantity"
                />
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 rounded-lg bg-gray-300 hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={quantity >= (product.sizes?.find((s) => s.size === selectedSize)?.quantity || 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {selectedSize && (
                <p className="text-sm mt-1 text-gray-500">
                  Max available: {product.sizes?.find((s) => s.size === selectedSize)?.quantity || 0}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="xl:flex lg:flex space-y-4 justify-end gap-4">
              <div className="xl:mt-[15px] lg:mt-[15px]">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-2 flex text-xs py-2 items-center bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Cancel adding to cart"
                >
                  <FiXCircle className="mr-2" />
                  Cancel
                </button>
              </div>
              <div className="flex sm:flex-row gap-2">
                <button
                  onClick={handleAddToCartClick}
                  className="flex text-xs items-center px-2 py-2 btn-gradient-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={
                    !selectedColor ||
                    !selectedSize ||
                    quantity < 1 ||
                    (product.sizes?.find((s) => s.size === selectedSize)?.quantity || 0) === 0
                  }
                  aria-label="Add to cart"
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNowClick}
                  className="flex text-xs items-center px-2 py-2 btn-gradient-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={
                    !selectedColor ||
                    !selectedSize ||
                    quantity < 1 ||
                    (product.sizes?.find((s) => s.size === selectedSize)?.quantity || 0) === 0
                  }
                  aria-label="Buy now"
                >
                  <FiCheckCircle className="mr-2" />
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
