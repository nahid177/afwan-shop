// src/components/ProductCard.tsx

import React, { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/mode/ThemeContext";
import { CartItem, IProduct, IProductType, IProductCategory } from "@/types";

interface ProductCardProps {
  product: IProduct;
  productType: IProductType;
  category: IProductCategory;
  addToCart: (product: CartItem) => void;
  triggerToast: (message: string, type: "success" | "error" | "warning") => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart, triggerToast }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0]?.size || "");
  const [quantity, setQuantity] = useState<number>(1);
  const { theme } = useTheme();

  const incrementQuantity = () => {
    const maxQuantity = product.sizes?.find((size) => size.size === selectedSize)?.quantity || 0;
    if (quantity < maxQuantity) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: product._id!.toString(), // Ensure _id is a string
      name: product.product_name,
      price: product.offerPrice || product.originalPrice,
      buyingPrice: product.buyingPrice,
      quantity,
      imageUrl: product.images[0] || "/placeholder.png",
      color: selectedColor,
      size: selectedSize,
      code: product.code, // 'code' is now required
    };
    
    addToCart(cartItem);
    setIsModalOpen(false);  // Close modal after adding to cart
    triggerToast(`${product.product_name} has been added to the cart!`, "success");  // Show success toast
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
      <h3 className="text-base font-medium mt-2 text-center">{product.product_name}</h3>
      <div className="mb-2 flex justify-center gap-2">
        {product.offerPrice && (
          <span className="text-red-500 text-lg font-bold">{product.offerPrice.toFixed(0)}৳</span>
        )}
        {product.originalPrice && product.originalPrice > product.offerPrice && (
          <span className="text-gray-500 line-through text-lg">{product.originalPrice.toFixed(0)}৳</span>
        )}
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full text-center py-2 rounded-lg btn-gradient-blue"
      >
        Add to Cart
      </button>

      {/* Modal for selecting options */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 ${theme === "light" ? "text-black" : "text-white"}`}
          >
            <h2 className="text-xl font-semibold mb-4">Select Options</h2>

            {/* Color selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Color:</label>
              <div className="flex flex-wrap gap-2">
                {product.colors?.map((colorItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(colorItem.color)}
                    className={`px-3 py-1 rounded-full border ${selectedColor === colorItem.color ? "bg-blue-500 text-white" : "bg-transparent text-gray-700 dark:text-gray-300"}`}
                    aria-pressed={selectedColor === colorItem.color}
                  >
                    {colorItem.color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Size:</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((sizeItem, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(sizeItem.size)}
                    className={`px-3 py-1 rounded-full border ${selectedSize === sizeItem.size ? "bg-green-500 text-white" : "bg-transparent text-gray-700 dark:text-gray-300"}`}
                    aria-pressed={selectedSize === sizeItem.size}
                  >
                    {sizeItem.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity selector */}
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
                      const currentSize = product.sizes?.find((s) => s.size === selectedSize);
                      const maxQuantity = currentSize?.quantity || 0;
                      setQuantity(val > maxQuantity ? maxQuantity : val);
                    }
                  }}
                  className={`w-16 text-center border rounded-lg px-2 py-1 ${theme === 'light' ? 'border-gray-400 bg-white text-gray-800' : 'border-gray-600 bg-gray-800 text-gray-200'}`}
                  min={1}
                  max={product.sizes?.find((s) => s.size === selectedSize)?.quantity || 0}
                  aria-label="Product quantity"
                />
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
                  disabled={quantity >= (product.sizes?.find((s) => s.size === selectedSize)?.quantity || 0)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {selectedSize && (
                <p className={`text-sm mt-1 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Max available: {product.sizes?.find((s) => s.size === selectedSize)?.quantity || 0}
                </p>
              )}
            </div>

            {/* Modal action buttons */}
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddToCart(); // Add to cart
                  setIsModalOpen(false); // Close modal
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!selectedColor || !selectedSize || quantity < 1 || (product.sizes?.find((size) => size.size === selectedSize)?.quantity || 0) === 0} // Disable if quantity is 0
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

export default ProductCard;
