// src/components/Admin/product-types-page/AddProductForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IProduct } from '@/types'; // Import the interface
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface AddProductFormProps {
  productTypeId: string;
  categoryName: string;
  onProductAdded: (newProduct: IProduct) => void;
}

interface INewProduct {
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

interface ISubtitle {
  title: string;
  titledetail: string;
}

interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface SelectedImage {
  file: File;
  preview: string;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  productTypeId,
  categoryName,
  onProductAdded,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    product_name: string;
    code: string;
    color: string;
    sizes: string; // Comma-separated sizes
    originalPrice: number;
    offerPrice: number;
    title: string;
    subtitle_title: string;
    subtitle_titledetail: string;
    description: string;
  }>({
    product_name: "",
    code: "",
    color: "",
    sizes: "",
    originalPrice: 0,
    offerPrice: 0,
    title: "",
    subtitle_title: "",
    subtitle_titledetail: "",
    description: "",
  });
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const totalImages = selectedImages.length + fileArray.length;

      if (totalImages > 5) {
        alert("You can upload a maximum of 5 images.");
        return;
      }

      const newSelectedImages: SelectedImage[] = fileArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...newSelectedImages]);
    }
  };

  // Handle image removal
  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [selectedImages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (
        !formData.product_name ||
        !formData.code ||
        !formData.color ||
        !formData.sizes ||
        formData.originalPrice <= 0 ||
        formData.offerPrice <= 0 ||
        !formData.title ||
        !formData.subtitle_title ||
        !formData.subtitle_titledetail ||
        !formData.description ||
        selectedImages.length === 0
      ) {
        setSubmitError("Please fill in all required fields and upload at least one image.");
        setSubmitting(false);
        return;
      }

      // Upload images
      const formDataImages = new FormData();
      selectedImages.forEach((image) => {
        formDataImages.append("files", image.file);
      });

      const uploadResponse = await axios.post<{ urls: string[] }>(
        "/api/upload",
        formDataImages,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const imageUrls = uploadResponse.data.urls;

      // Prepare new product data
      const newProduct: INewProduct = {
        product_name: formData.product_name,
        code: formData.code.split(",").map((code) => code.trim()),
        color: formData.color.split(",").map((color) => color.trim()),
        sizes: formData.sizes.split(",").map((sizeStr) => {
          const [size, quantityStr] = sizeStr.split(":").map((s) => s.trim());
          return {
            size,
            quantity: parseInt(quantityStr, 10) || 0,
          };
        }),
        originalPrice: formData.originalPrice,
        offerPrice: formData.offerPrice,
        title: formData.title.split(",").map((t) => t.trim()),
        subtitle: [
          {
            title: formData.subtitle_title,
            titledetail: formData.subtitle_titledetail,
          },
        ],
        description: formData.description,
        images: imageUrls,
      };

      // Log the product being sent
      console.log('Submitting product:', newProduct);

      // Send PATCH request to add the new product
      const patchResponse = await axios.patch<IProduct[]>(
        `/api/product-types/${productTypeId}/categories/${categoryName}`,
        { product: [newProduct] }
      );

      // Notify parent component of the new product
      onProductAdded(patchResponse.data[0]);

      // Reset the form
      setFormData({
        product_name: "",
        code: "",
        color: "",
        sizes: "",
        originalPrice: 0,
        offerPrice: 0,
        title: "",
        subtitle_title: "",
        subtitle_titledetail: "",
        description: "",
      });
      setSelectedImages([]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding product:", err);
      setSubmitError("Failed to add product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
      >
        <FaPlus className="mr-2" /> Add Product
      </button>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          {/* Modal Content */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center">
                    <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                      Add New Product
                    </Dialog.Title>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label="Close Modal"
                    >
                      <FaTimes size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="mt-4">
                    {/* Grid Layout for Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Product Name
                        </label>
                        <input
                          type="text"
                          name="product_name"
                          value={formData.product_name}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="e.g., Summer T-Shirt"
                        />
                      </div>

                      {/* Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Code (comma separated)
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="e.g., CODE1, CODE2"
                        />
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Color (comma separated)
                        </label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="e.g., Red, Blue"
                        />
                      </div>

                      {/* Sizes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Sizes (comma separated, format: Size:Quantity)
                        </label>
                        <input
                          type="text"
                          name="sizes"
                          value={formData.sizes}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="e.g., S:10, M:20, L:15"
                        />
                      </div>

                      {/* Original Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Original Price ($)
                        </label>
                        <input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      {/* Offer Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Offer Price ($)
                        </label>
                        <input
                          type="number"
                          name="offerPrice"
                          value={formData.offerPrice}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      {/* Title */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Title (comma separated)
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="e.g., New Arrival, Limited Edition"
                        />
                      </div>

                      {/* Subtitle Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Subtitle Title
                        </label>
                        <input
                          type="text"
                          name="subtitle_title"
                          value={formData.subtitle_title}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="e.g., Features"
                        />
                      </div>

                      {/* Subtitle Detail */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Subtitle Detail
                        </label>
                        <textarea
                          name="subtitle_titledetail"
                          value={formData.subtitle_titledetail}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="e.g., Durable material, Modern design"
                        ></textarea>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                          placeholder="Detailed description of the product."
                        ></textarea>
                      </div>

                      {/* Images */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Product Images (Max 5)
                        </label>
                        <input
                          type="file"
                          name="images"
                          onChange={handleImageChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          accept="image/*"
                          multiple
                        />
                        {selectedImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {selectedImages.map((image, index) => (
                              <div key={index} className="relative">
                                <Image
                                  src={image.preview}
                                  alt={`Selected Image ${index + 1}`}
                                  width={100}
                                  height={100}
                                  className="object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                                  aria-label={`Remove Image ${index + 1}`}
                                >
                                  <FaTimes size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Display Submit Error */}
                    {submitError && (
                      <p className="text-red-500 mt-2">{submitError}</p>
                    )}

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="mr-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        onClick={() => setIsModalOpen(false)}
                        disabled={submitting}
                        aria-label="Cancel"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                          submitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={submitting}
                        aria-label="Submit Product"
                      >
                        {submitting ? 'Submitting...' : 'Submit Product'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddProductForm;
