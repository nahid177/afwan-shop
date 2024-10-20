// src/components/Admin/product-types-page/ProductCard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ISubtitle {
  title: string;
  titledetail: string;
}

interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface IProduct {
  _id: string;
  product_name: string;
  code: string[];
  color: string[];
  sizes: ISizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
}

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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
      if (e) e.stopPropagation(); // Prevent modal from closing when clicking buttons or pressing keys
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
        if (e.key === 'ArrowRight') {
          showNextImage(e);
        } else if (e.key === 'ArrowLeft') {
          showPrevImage(e);
        } else if (e.key === 'Escape') {
          closeModal();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // Cleanup event listener on component unmount or when modal closes
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen, showNextImage, showPrevImage, closeModal]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
        {product.title && product.title.length > 0 && (
          <ul className="mb-2">
            {product.title.map((titleItem, index) => (
              <li key={index} className="text-gray-700">
                {titleItem}
              </li>
            ))}
          </ul>
        )}

        {/* Subtitles */}
        {product.subtitle && product.subtitle.length > 0 && (
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
        {product.code && product.code.length > 0 && (
          <p className="text-gray-700 mb-2">
            <strong>Codes:</strong> {product.code.join(', ')}
          </p>
        )}

        {/* Colors */}
        {product.color && product.color.length > 0 && (
          <p className="text-gray-700 mb-2">
            <strong>Colors:</strong> {product.color.join(', ')}
          </p>
        )}

        {/* Sizes with Quantities */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-2">
            <strong>Sizes & Quantities:</strong>
            <ul>
              {product.sizes.map((sizeItem, index) => (
                <li key={index}>
                  {sizeItem.size}: {sizeItem.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prices */}
        <p className="text-gray-700 mb-2">
          <strong>Original Price:</strong> ${product.originalPrice.toFixed(2)}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Offer Price:</strong> ${product.offerPrice.toFixed(2)}
        </p>
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
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking the image
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
