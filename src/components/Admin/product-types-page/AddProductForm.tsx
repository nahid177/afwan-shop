// src/components/Admin/product-types-page/AddProductForm.tsx

"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IProduct, ISizeQuantity, ISubtitle, IColorQuantity } from '@/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface AddProductFormProps {
  productTypeId: string;
  categoryName: string;
  onProductAdded: (newProduct: IProduct) => void;
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
    originalPrice: number;
    offerPrice: number;
    buyingPrice: number; // New Field
    title: string;
    description: string;
  }>({
    product_name: '',
    code: '',
    originalPrice: 0,
    offerPrice: 0,
    buyingPrice: 0, // Initialize
    title: '',
    description: '',
  });
  const [sizes, setSizes] = useState<ISizeQuantity[]>([
    { size: '', quantity: 0 },
  ]);
  const [colors, setColors] = useState<IColorQuantity[]>([
    { color: '', quantity: 0 },
  ]);
  const [subtitles, setSubtitles] = useState<ISubtitle[]>([
    { title: '', titledetail: '' },
  ]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle input changes for simple fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value } = target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle sizes input
  const handleSizeChange = (
    index: number,
    field: keyof ISizeQuantity,
    value: string | number
  ) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
  };

  const addSizeField = () => {
    setSizes([...sizes, { size: '', quantity: 0 }]);
  };

  const removeSizeField = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle colors input
  const handleColorChange = (
    index: number,
    field: keyof IColorQuantity,
    value: string | number
  ) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  const addColorField = () => {
    setColors([...colors, { color: '', quantity: 0 }]);
  };

  const removeColorField = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle subtitles input
  const handleSubtitleChange = (
    index: number,
    field: keyof ISubtitle,
    value: string
  ) => {
    const newSubtitles = [...subtitles];
    newSubtitles[index] = { ...newSubtitles[index], [field]: value };
    setSubtitles(newSubtitles);
  };

  const addSubtitleField = () => {
    setSubtitles([...subtitles, { title: '', titledetail: '' }]);
  };

  const removeSubtitleField = (index: number) => {
    setSubtitles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const totalImages = selectedImages.length + fileArray.length;

      if (totalImages > 5) {
        alert('You can upload a maximum of 5 images.');
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
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(updated[index].preview);
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
      // Validate required fields, including buyingPrice
      if (
        !formData.product_name ||
        !formData.code ||
        sizes.length === 0 ||
        colors.length === 0 ||
        formData.originalPrice <= 0 ||
        formData.offerPrice <= 0 ||
        formData.buyingPrice <= 0 || // Ensure buyingPrice is provided
        !formData.title ||
        subtitles.length === 0 ||
        !formData.description ||
        selectedImages.length === 0
      ) {
        setSubmitError(
          'Please fill in all required fields, including Buying Price.'
        );
        setSubmitting(false);
        return;
      }

      // Filter out empty sizes and colors
      const filteredSizes = sizes.filter(
        (size) => size.size.trim() !== '' && size.quantity > 0
      );

      const filteredColors = colors.filter(
        (color) => color.color.trim() !== '' && color.quantity > 0
      );

      // Upload images
      const formDataImages = new FormData();
      selectedImages.forEach((image) => {
        formDataImages.append('files', image.file);
      });

      const uploadResponse = await axios.post<{ urls: string[] }>(
        '/api/upload',
        formDataImages,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const imageUrls = uploadResponse.data.urls;

      // Prepare new product data
      const newProduct: IProduct = {
        product_name: formData.product_name,
        code: formData.code.split(',').map((code) => code.trim()),
        colors: filteredColors,
        sizes: filteredSizes,
        originalPrice: formData.originalPrice,
        offerPrice: formData.offerPrice,
        buyingPrice: formData.buyingPrice, // Include buyingPrice
        title: formData.title.split(',').map((t) => t.trim()),
        subtitle: subtitles,
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
        product_name: '',
        code: '',
        originalPrice: 0,
        offerPrice: 0,
        buyingPrice: 0, // Reset buyingPrice
        title: '',
        description: '',
      });
      setSizes([{ size: '', quantity: 0 }]);
      setColors([{ color: '', quantity: 0 }]);
      setSubtitles([{ title: '', titledetail: '' }]);
      setSelectedImages([]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding product:', err);
      setSubmitError('Failed to add product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Button to open the modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
      >
        <FaPlus className="mr-2" /> Add Product
      </button>

      {/* Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
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

                      {/* Buying Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Buying Price ($)
                        </label>
                        <input
                          type="number"
                          name="buyingPrice"
                          value={formData.buyingPrice}
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

                      {/* Sizes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Sizes & Quantities
                        </label>
                        {sizes.map((sizeItem, index) => (
                          <div key={index} className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              placeholder="Size"
                              className="w-1/2 border px-3 py-2 rounded"
                              value={sizeItem.size}
                              onChange={(e) =>
                                handleSizeChange(index, 'size', e.target.value)
                              }
                            />
                            <input
                              type="number"
                              placeholder="Quantity"
                              className="w-1/2 border px-3 py-2 rounded"
                              value={sizeItem.quantity}
                              onChange={(e) =>
                                handleSizeChange(
                                  index,
                                  'quantity',
                                  parseInt(e.target.value)
                                )
                              }
                            />
                            {sizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSizeField(index)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                aria-label={`Remove Size ${index + 1}`}
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSizeField}
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FaPlus className="mr-1" /> Add Another Size
                        </button>
                      </div>

                      {/* Colors */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Colors & Quantities
                        </label>
                        {colors.map((colorItem, index) => (
                          <div key={index} className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              placeholder="Color"
                              className="w-1/2 border px-3 py-2 rounded"
                              value={colorItem.color}
                              onChange={(e) =>
                                handleColorChange(index, 'color', e.target.value)
                              }
                            />
                            <input
                              type="number"
                              placeholder="Quantity"
                              className="w-1/2 border px-3 py-2 rounded"
                              value={colorItem.quantity}
                              onChange={(e) =>
                                handleColorChange(
                                  index,
                                  'quantity',
                                  parseInt(e.target.value)
                                )
                              }
                            />
                            {colors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeColorField(index)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                aria-label={`Remove Color ${index + 1}`}
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addColorField}
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FaPlus className="mr-1" /> Add Another Color
                        </button>
                      </div>

                      {/* Subtitles */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Subtitles
                        </label>
                        {subtitles.map((subtitleItem, index) => (
                          <div
                            key={index}
                            className="mb-4 border p-2 rounded relative"
                          >
                            <button
                              type="button"
                              onClick={() => removeSubtitleField(index)}
                              className="absolute top-1 right-1 text-red-600 hover:text-red-800 focus:outline-none"
                              aria-label={`Remove Subtitle ${index + 1}`}
                            >
                              <FaTimes size={16} />
                            </button>
                            <input
                              type="text"
                              placeholder="Subtitle Title"
                              className="w-full border px-3 py-2 rounded mb-2"
                              value={subtitleItem.title}
                              onChange={(e) =>
                                handleSubtitleChange(index, 'title', e.target.value)
                              }
                            />
                            <textarea
                              placeholder="Subtitle Detail"
                              className="w-full border px-3 py-2 rounded"
                              value={subtitleItem.titledetail}
                              onChange={(e) =>
                                handleSubtitleChange(
                                  index,
                                  'titledetail',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSubtitleField}
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FaPlus className="mr-1" /> Add Another Subtitle
                        </button>
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
                          <div className="flex flex-wrap mt-2">
                            {selectedImages.map((image, idx) => (
                              <div key={idx} className="relative mr-2 mb-2 w-24 h-24">
                                <Image
                                  src={image.preview}
                                  alt={`Selected Image ${idx + 1}`}
                                  layout="fill"
                                  objectFit="cover"
                                  className="rounded"
                                />
                                {/* Remove Image Button */}
                                <button
                                  type="button"
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                  onClick={() => removeImage(idx)}
                                  title="Remove Image"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Display number of images selected */}
                        <p className="text-sm text-gray-500">
                          {selectedImages.length} / 5 images selected
                        </p>
                      </div>
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                      <p className="text-red-500 text-sm mt-2">{submitError}</p>
                    )}

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                          submitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : 'Add Product'}
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
