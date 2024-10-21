// src/app/admin/product-types/[id]/[categoryname]/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import AddProductForm from "@/components/Admin/product-types-page/AddProductForm";
import AdminLayoutTypesName from "@/app/admin/product-types/AdminLayoutTypesName";
import AdminLayout from "@/app/admin/AdminLayout";
import { Dialog, Transition } from "@headlessui/react"; // Import Headless UI components
import { Fragment } from "react";
import { FaTimes, FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Import icons for modal

interface IProduct {
  _id: string;
  product_name: string;
  code: string[];
  color: string[];
  sizes: {
    size: string;
    quantity: number;
  }[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: {
    title: string;
    titledetail: string;
  }[];
  description: string;
  images: string[];
}

const CategoryPage: React.FC = () => {
  const params = useParams();
  const { id, categoryname } = params as { id: string; categoryname: string };
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentProductImages, setCurrentProductImages] = useState<string[]>([]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Removed encodeURIComponent to prevent double encoding
        const response = await axios.get<IProduct[]>(
          `/api/product-types/${id}/categories/${categoryname}`
        );
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, categoryname]);

  // Function to handle adding a new product to the state
  const handleProductAdded = (newProduct: IProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  // Function to open modal with selected image
  const openModal = (images: string[], index: number) => {
    setCurrentProductImages(images);
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentImageIndex(0);
    setCurrentProductImages([]);
  }, []);

  // Function to go to the next image
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === currentProductImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [currentProductImages.length]);

  // Function to go to the previous image
  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? currentProductImages.length - 1 : prevIndex - 1
    );
  }, [currentProductImages.length]);

  // Handle keyboard events for image navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (event.key === "ArrowRight") {
        nextImage();
      } else if (event.key === "ArrowLeft") {
        prevImage();
      } else if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, nextImage, prevImage, closeModal]);

  if (loading) {
    return (
      <AdminLayout>
        <AdminLayoutTypesName>
          <div className="flex justify-center items-center h-screen">
            <p className="text-gray-500">Loading products...</p>
          </div>
        </AdminLayoutTypesName>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <AdminLayoutTypesName>
          <div className="flex justify-center items-center h-screen">
            <p className="text-red-500">{error}</p>
          </div>
        </AdminLayoutTypesName>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminLayoutTypesName>
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Products in &quot;{categoryname}&quot; Category
          </h1>

          {/* Product List */}
          <div className="mb-8">
            {products.length === 0 ? (
              <p className="text-gray-500">No products available in this category.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="border rounded-lg p-6 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col items-center">
                      {/* Product Images */}
                      <div className="flex space-x-2 mb-4">
                        {product.images.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-32 h-32 cursor-pointer"
                            onClick={() => openModal(product.images, idx)}
                          >
                            <Image
                              src={url}
                              alt={`Product Image ${idx + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-md"
                              // Add fallback for broken images
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite loop
                                target.src = "/fallback-image.png"; // Correct path
                              }}
                              loading="lazy" // Enable lazy loading
                            />
                          </div>
                        ))}
                      </div>

                      {/* Product Details */}
                      <h2 className="text-2xl font-semibold mb-2 text-center truncate">
                        {product.product_name}
                      </h2>
                      <p className="text-gray-600 mb-4 text-center">{product.description}</p>
                      <div className="w-full">
                        <div className="mb-2">
                          <span className="font-semibold">Original Price:</span> $
                          {product.originalPrice.toFixed(2)}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Offer Price:</span> $
                          {product.offerPrice.toFixed(2)}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Codes:</span> {product.code.join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Colors:</span> {product.color.join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Sizes:</span>{" "}
                          {product.sizes
                            .map((size) => `${size.size} (${size.quantity})`)
                            .join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Titles:</span> {product.title.join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Subtitles:</span>
                          <ul className="list-disc list-inside">
                            {product.subtitle.map((sub, idx) => (
                              <li key={idx}>
                                <strong>{sub.title}:</strong> {sub.titledetail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Product Form */}
          <AddProductForm
            productTypeId={id}
            categoryName={categoryname}
            onProductAdded={handleProductAdded}
          />
        </div>

        {/* Image Modal */}
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={closeModal}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {/* Overlay as a div */}
                <div className="fixed inset-0 bg-black bg-opacity-75" />
              </Transition.Child>

              {/* This element is to center the modal contents */}
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label="Close Modal"
                    >
                      <FaTimes size={24} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center relative">
                    {/* Previous Button */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 text-white bg-gray-700 bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 focus:outline-none"
                      aria-label="Previous Image"
                    >
                      <FaArrowLeft size={20} />
                    </button>

                    {/* Current Image */}
                    <div className="w-full h-96 relative">
                      <Image
                        src={currentProductImages[currentImageIndex]}
                        alt={`Product Image ${currentImageIndex + 1}`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                        // Add fallback for broken images
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = "/fallback-image.png"; // Correct path
                        }}
                      />
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={nextImage}
                      className="absolute right-4 text-white bg-gray-700 bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 focus:outline-none"
                      aria-label="Next Image"
                    >
                      <FaArrowRight size={20} />
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <p>
                      Image {currentImageIndex + 1} of {currentProductImages.length}
                    </p>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </AdminLayoutTypesName>
    </AdminLayout>
  );
};

export default CategoryPage;
