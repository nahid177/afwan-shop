// src/components/Admin/product-types-page/EditProduct.tsx

"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { IProduct, ISubtitle, ISizeQuantity, IColorQuantity } from '@/types';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';

interface EditProductFormProps {
  productTypeId: string;
  categoryName: string;
  product: IProduct;
  onProductUpdated: (updatedProduct: IProduct) => void;
  onClose: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  productTypeId,
  categoryName,
  product,
  onProductUpdated,
  onClose,
}) => {
  const [formData, setFormData] = useState<IProduct>({ ...product });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle input changes for simple fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Convert numeric fields appropriately
    if (name === 'originalPrice' || name === 'offerPrice' || name === 'buyingPrice') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle array fields like code, title
  const handleArrayChange = (name: keyof IProduct, values: string[]) => {
    setFormData((prev) => ({ ...prev, [name]: values }));
  };

  // Handle sizes
  const handleSizesChange = (sizes: ISizeQuantity[]) => {
    setFormData((prev) => ({ ...prev, sizes }));
  };

  // Handle colors
  const handleColorsChange = (colors: IColorQuantity[]) => {
    setFormData((prev) => ({ ...prev, colors }));
  };

  // Handle subtitles
  const handleSubtitleChange = (subtitle: ISubtitle[]) => {
    setFormData((prev) => ({ ...prev, subtitle }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = formData.images.length + filesArray.length;
      if (totalImages > 5) {
        alert('You can upload a maximum of 5 images.');
        return;
      }
      setSelectedFiles(filesArray);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      const formDataFiles = new FormData();
      selectedFiles.forEach((file) => {
        formDataFiles.append('files', file);
      });

      const response = await axios.post<{ urls: string[] }>('/api/upload', formDataFiles, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { urls } = response.data;

      // Add new image URLs to formData.images
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));

      // Clear selected files
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  // Remove image from formData.images
  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required.';
    }
    if (formData.originalPrice < 0) {
      newErrors.originalPrice = 'Original price cannot be negative.';
    }
    if (formData.offerPrice < 0) {
      newErrors.offerPrice = 'Offer price cannot be negative.';
    }
    if (formData.buyingPrice < 0) {
      newErrors.buyingPrice = 'Buying price cannot be negative.';
    }

    // Add more validations as needed

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Helper functions to render array inputs
  const renderArrayInput = (
    label: string,
    name: keyof IProduct,
    values: string[]
  ) => (
    <div className="mb-4">
      <label className="block font-semibold mb-2">{label}</label>
      {values.map((value, index) => (
        <div key={index} className="flex mb-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValues = [...values];
              newValues[index] = e.target.value;
              handleArrayChange(name, newValues);
            }}
            className={`w-full border rounded px-3 py-2 ${
              errors[name] ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors[name]}
          />
          <button
            type="button"
            onClick={() => {
              const newValues = values.filter((_, i) => i !== index);
              handleArrayChange(name, newValues);
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            aria-label={`Remove ${label}`}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => handleArrayChange(name, [...values, ''])}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
      >
        <FiPlus className="mr-1" /> Add {label.slice(0, -1)}
      </button>
      {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
    </div>
  );

  // Helper functions to render sizes input
  const renderSizesInput = () => (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Sizes</label>
      {formData.sizes.map((sizeObj, index) => (
        <div key={index} className="flex mb-2 space-x-2">
          <input
            type="text"
            placeholder="Size"
            value={sizeObj.size}
            onChange={(e) => {
              const newSizes = [...formData.sizes];
              newSizes[index].size = e.target.value;
              handleSizesChange(newSizes);
            }}
            className="w-1/2 border rounded px-3 py-2"
            aria-label={`Size ${index + 1}`}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={sizeObj.quantity}
            onChange={(e) => {
              const newSizes = [...formData.sizes];
              newSizes[index].quantity = parseInt(e.target.value, 10) || 0;
              handleSizesChange(newSizes);
            }}
            className="w-1/2 border rounded px-3 py-2"
            min="0"
            aria-label={`Quantity for size ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => {
              const newSizes = formData.sizes.filter((_, i) => i !== index);
              handleSizesChange(newSizes);
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            aria-label="Remove Size"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          handleSizesChange([...formData.sizes, { size: '', quantity: 0 }])
        }
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
      >
        <FiPlus className="mr-1" /> Add Size
      </button>
    </div>
  );

  // Helper functions to render colors input
  const renderColorsInput = () => (
    <div className="mb-4 ">
      <label className="block font-semibold mb-2">Colors</label>
      {formData.colors.map((colorObj, index) => (
        <div key={index} className="flex mb-2 space-x-2">
          <input
            type="text"
            placeholder="Color"
            value={colorObj.color}
            onChange={(e) => {
              const newColors = [...formData.colors];
              newColors[index].color = e.target.value;
              handleColorsChange(newColors);
            }}
            className="w-1/2 border rounded px-3 py-2"
            aria-label={`Color ${index + 1}`}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={colorObj.quantity}
            onChange={(e) => {
              const newColors = [...formData.colors];
              newColors[index].quantity = parseInt(e.target.value, 10) || 0;
              handleColorsChange(newColors);
            }}
            className="w-1/2 border rounded px-3 py-2"
            min="0"
            aria-label={`Quantity for color ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => {
              const newColors = formData.colors.filter((_, i) => i !== index);
              handleColorsChange(newColors);
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            aria-label="Remove Color"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          handleColorsChange([...formData.colors, { color: '', quantity: 0 }])
        }
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
      >
        <FiPlus className="mr-1" /> Add Color
      </button>
    </div>
  );

  // Helper functions to render subtitles input
  const renderSubtitlesInput = () => (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Subtitles</label>
      {formData.subtitle.map((subObj, index) => (
        <div key={index} className="mb-2">
          <input
            type="text"
            placeholder="Title"
            value={subObj.title}
            onChange={(e) => {
              const newSubtitles = [...formData.subtitle];
              newSubtitles[index].title = e.target.value;
              handleSubtitleChange(newSubtitles);
            }}
            className="w-full border rounded px-3 py-2 mb-2"
            aria-label={`Subtitle Title ${index + 1}`}
          />
          <textarea
            placeholder="Title Detail"
            value={subObj.titledetail}
            onChange={(e) => {
              const newSubtitles = [...formData.subtitle];
              newSubtitles[index].titledetail = e.target.value;
              handleSubtitleChange(newSubtitles);
            }}
            className="w-full border rounded px-3 py-2 mb-2"
            rows={3}
            aria-label={`Subtitle Detail ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => {
              const newSubtitles = formData.subtitle.filter((_, i) => i !== index);
              handleSubtitleChange(newSubtitles);
            }}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            aria-label="Remove Subtitle"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          handleSubtitleChange([...formData.subtitle, { title: '', titledetail: '' }])
        }
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
      >
        <FiPlus className="mr-1" /> Add Subtitle
      </button>
    </div>
  );

  // Render images input with upload functionality
  const renderImagesInput = () => (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Images</label>
      {/* Display existing images */}
      {formData.images.map((imageUrl, index) => (
        <div key={index} className="flex items-center mb-2">
          <div className="w-16 h-16 relative mr-2">
            <Image
              src={imageUrl}
              alt={`Image ${index}`}
              layout="fill"
              objectFit="cover"
              className="rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/fallback-image.png';
              }}
            />
          </div>
          <span className="flex-1 truncate">{imageUrl}</span>
          <button
            type="button"
            onClick={() => handleRemoveImage(index)}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            aria-label="Remove Image"
          >
            Remove
          </button>
        </div>
      ))}
      {/* File input for new images */}
      <div className="mb-2">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
          aria-label="Select Images"
        />
      </div>
      {/* Display selected files */}
      {selectedFiles.length > 0 && (
        <div className="mb-2">
          <p className="font-semibold">Selected Files:</p>
          <ul className="list-disc list-inside">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-2 px-4 py-2 rounded text-white ${
              uploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      )}
    </div>
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // If there are selected files, upload them first
    if (selectedFiles.length > 0) {
      await handleUpload();
    }

    try {
      const response = await axios.put<IProduct>(
        `/api/product-types/${productTypeId}/categories/${categoryName}/products/${product._id}`,
        formData
      );
      onProductUpdated(response.data);
      onClose();
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={onClose}
          aria-label="Close Edit Product Form"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Edit Product</h2>
        <form onSubmit={handleSubmit}>
          {/* Product Information Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Product Information</h3>
            {/* Product Name */}
            <div className="mb-4">
              <label htmlFor="product_name" className="block font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.product_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                aria-required="true"
                aria-invalid={!!errors.product_name}
              />
              {errors.product_name && (
                <p className="text-red-500 text-sm mt-1">{errors.product_name}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                rows={4}
                aria-multiline="true"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Pricing</h3>
            {/* Original Price */}
            <div className="mb-4">
              <label htmlFor="originalPrice" className="block font-medium mb-2">
                Original Price
              </label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                aria-invalid={!!errors.originalPrice}
              />
              {errors.originalPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>
              )}
            </div>

            {/* Offer Price */}
            <div className="mb-4">
              <label htmlFor="offerPrice" className="block font-medium mb-2">
                Offer Price
              </label>
              <input
                type="number"
                id="offerPrice"
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleInputChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.offerPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                aria-invalid={!!errors.offerPrice}
              />
              {errors.offerPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.offerPrice}</p>
              )}
            </div>

            {/* Buying Price */}
            <div className="mb-4">
              <label htmlFor="buyingPrice" className="block font-medium mb-2">
                Buying Price
              </label>
              <input
                type="number"
                id="buyingPrice"
                name="buyingPrice"
                value={formData.buyingPrice}
                onChange={handleInputChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.buyingPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                required
                aria-required="true"
                aria-invalid={!!errors.buyingPrice}
              />
              {errors.buyingPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.buyingPrice}</p>
              )}
            </div>
          </div>

          {/* Variants Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Variants</h3>
            {/* Codes */}
            {renderArrayInput('Codes', 'code', formData.code)}

            {/* Titles */}
            {renderArrayInput('Titles', 'title', formData.title)}

            {/* Subtitles */}
            {renderSubtitlesInput()}

            {/* Sizes */}
            {renderSizesInput()}

            {/* Colors */}
            {renderColorsInput()}
          </div>

          {/* Images Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Images</h3>
            {renderImagesInput()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
