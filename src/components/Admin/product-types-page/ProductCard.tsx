import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { IProduct } from '@/types'; // Import IProduct from types.ts

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // State for color and size selection
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // State to manage modal visibility and current image index
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Open modal and set the current image index
  const openModal = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Show next image
  const showNextImage = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e) e.stopPropagation();
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
    },
    [product.images.length]
  );

  // Show previous image
  const showPrevImage = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e) e.stopPropagation();
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length
      );
    },
    [product.images.length]
  );

  // Add event listener for keydown when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') showNextImage(e);
        else if (e.key === 'ArrowLeft') showPrevImage(e);
        else if (e.key === 'Escape') closeModal();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, showNextImage, showPrevImage, closeModal]);

  const handleColorSelect = (color: string, quantity: number) => {
    if (quantity > 0) setSelectedColor(color);
  };

  const handleSizeSelect = (size: string, quantity: number) => {
    if (quantity > 0) setSelectedSize(size);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
      {/* Product Image */}
      {product.images && product.images.length > 0 && (
        <div
          className="relative w-full h-64 cursor-pointer"
          onClick={() => openModal(0)}
        >
          <Image
            src={product.images[0]}
            alt={product.product_name}
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.product_name}</h2>

        {/* Titles */}
        {product.title?.length > 0 && (
          <ul className="mb-2">
            {product.title.map((titleItem, index) => (
              <li key={index} className="text-gray-700">
                {titleItem}
              </li>
            ))}
          </ul>
        )}

        {/* Subtitles */}
        {product.subtitle?.length > 0 && (
          <div className="mb-2">
            {product.subtitle.map((sub, index) => (
              <div key={index}>
                <h3 className="font-semibold">{sub.title}</h3>
                <p className="text-gray-600">{sub.titledetail}</p>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-gray-700 mb-2">{product.description}</p>

        {/* Codes */}
        {product.code?.length > 0 && (
          <p className="text-gray-700 mb-2">
            <strong>Codes:</strong> {product.code.join(', ')}
          </p>
        )}

        {/* Color Selection */}
        <div className="color-selection my-4">
          <h3>Select Color:</h3>
          <div className="flex gap-2">
            {product.colors.map((colorItem) => (
              <button
                key={colorItem.color}
                onClick={() => handleColorSelect(colorItem.color, colorItem.quantity)}
                className={`px-3 py-1 rounded-full ${
                  colorItem.quantity > 0 ? "border border-gray-500" : "border border-gray-300 text-gray-400"
                } ${selectedColor === colorItem.color && colorItem.quantity > 0 ? "bg-blue-500 text-white" : ""}`}
                disabled={colorItem.quantity === 0}
              >
                {colorItem.quantity > 0 ? colorItem.color : "N/A"}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="size-selection my-4">
          <h3>Select Size:</h3>
          <div className="flex gap-2">
            {product.sizes.map((sizeItem) => (
              <button
                key={sizeItem.size}
                onClick={() => handleSizeSelect(sizeItem.size, sizeItem.quantity)}
                className={`px-3 py-1 rounded-full ${
                  sizeItem.quantity > 0 ? "border border-gray-500" : "border border-gray-300 text-gray-400"
                } ${selectedSize === sizeItem.size && sizeItem.quantity > 0 ? "bg-green-500 text-white" : ""}`}
                disabled={sizeItem.quantity === 0}
              >
                {sizeItem.quantity > 0 ? sizeItem.size : "N/A"}
              </button>
            ))}
          </div>
        </div>

        {/* Prices */}
        <p className="text-gray-700 mb-2">
          <strong>Original Price:</strong> ${product.originalPrice.toFixed(2)}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Offer Price:</strong> ${product.offerPrice.toFixed(2)}
        </p>

        {/* Add to Cart */}
        <button
          className="add-to-cart-button bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
          disabled={!selectedColor || !selectedSize}
        >
          Add to Cart
        </button>
      </div>

      {/* Fullscreen Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              aria-label="Close"
            >
              &times;
            </button>

            {/* Previous Button */}
            {product.images.length > 1 && (
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold focus:outline-none"
                onClick={showPrevImage}
                aria-label="Previous Image"
              >
                &#8249;
              </button>
            )}

            {/* Fullscreen Image */}
            <div className="relative w-full h-full max-h-screen max-w-screen-md">
              <Image
                src={product.images[currentImageIndex]}
                alt={product.product_name}
                layout="fill"
                objectFit="contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next Button */}
            {product.images.length > 1 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold focus:outline-none"
                onClick={showNextImage}
                aria-label="Next Image"
              >
                &#8250;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
