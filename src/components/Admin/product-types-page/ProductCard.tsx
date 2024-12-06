"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IProduct } from "@/types";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // State for image modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Open modal and set current image
  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Show previous image
  const showPrevImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0
        ? product.images.length > 0
          ? product.images.length - 1
          : 0
        : prevIndex - 1
    );
  };

  // Show next image
  const showNextImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Calculate total quantity if needed
  const calculateTotalQuantity = () => {
    // Assuming that the total quantity is the sum of quantities across all colors and sizes
    const totalColors = product.colors.reduce(
      (acc, color) => acc + color.quantity,
      0
    );
    const totalSizes = product.sizes.reduce(
      (acc, size) => acc + size.quantity,
      0
    );
    return totalColors + totalSizes; // Adjust this calculation as needed
  };

  const totalQuantity =
    product.totalQuantity !== undefined && product.totalQuantity !== null
      ? product.totalQuantity
      : calculateTotalQuantity();

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
            className="rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/fallback-image.png"; // Path to a fallback image
            }}
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
            <strong>Codes:</strong> {product.code.join(", ")}
          </p>
        )}

        {/* Buying Price */}
        <p className="text-gray-700 mb-2">
          <strong>Buying Price:</strong>{" "}
          {product.buyingPrice !== undefined && product.buyingPrice !== null
            ? `$${product.buyingPrice.toFixed(2)}`
            : "N/A"}
        </p>

        {/* Prices */}
        <p className="text-gray-700 mb-2">
          <strong>Original Price:</strong> ${product.originalPrice.toFixed(2)}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Offer Price:</strong> ${product.offerPrice.toFixed(2)}
        </p>

        {/* Total Quantity */}
        <p className="text-gray-700 mb-2">
          <strong>Total Quantity:</strong> {totalQuantity}
        </p>

        {/* Available Colors */}
        <div className="color-availability my-4">
          <h3 className="font-semibold mb-2">Available Colors:</h3>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((colorItem) => (
              <span
                key={colorItem.color}
                className={`px-3 py-1 rounded-full border ${
                  colorItem.quantity > 0
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } flex items-center justify-center`}
              >
                {colorItem.color}{" "}
                <span className="ml-1 text-sm">({colorItem.quantity})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Available Sizes */}
        <div className="size-availability my-4">
          <h3 className="font-semibold mb-2">Available Sizes:</h3>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((sizeItem) => (
              <span
                key={sizeItem.size}
                className={`px-3 py-1 rounded-full border ${
                  sizeItem.quantity > 0
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } flex items-center justify-center`}
              >
                {sizeItem.size}{" "}
                <span className="ml-1 text-sm">({sizeItem.quantity})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
              onClick={closeModal}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            {/* Previous Button */}
            {product.images.length > 1 && (
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold focus:outline-none"
                onClick={showPrevImage}
                aria-label="Previous Image"
              >
                <FaChevronLeft />
              </button>
            )}

            {/* Fullscreen Image */}
            <div className="relative w-full h-full max-h-screen max-w-screen-md">
              <Image
                src={product.images[currentImageIndex]}
                alt={`${product.product_name} Image ${currentImageIndex + 1}`}
                layout="fill"
                objectFit="contain"
                className="rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/fallback-image.png"; // Path to a fallback image
                }}
              />
            </div>

            {/* Next Button */}
            {product.images.length > 1 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl font-bold focus:outline-none"
                onClick={showNextImage}
                aria-label="Next Image"
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
