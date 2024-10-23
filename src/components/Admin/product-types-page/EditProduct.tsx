import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { IProduct, ISubtitle, ISizeQuantity, IColorQuantity } from '@/types'; // Import interfaces

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

  // Handle input changes for simple fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Convert numeric fields appropriately
    if (name === 'originalPrice' || name === 'offerPrice') {
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
      setSelectedFiles(Array.from(e.target.files));
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={() => {
              const newValues = values.filter((_, i) => i !== index);
              handleArrayChange(name, newValues);
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => handleArrayChange(name, [...values, ''])}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Add {label}
      </button>
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
          />
          <input
            type="number"
            placeholder="Quantity"
            value={sizeObj.quantity}
            onChange={(e) => {
              const newSizes = [...formData.sizes];
              newSizes[index].quantity = parseInt(e.target.value) || 0;
              handleSizesChange(newSizes);
            }}
            className="w-1/2 border rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={() => {
              const newSizes = formData.sizes.filter((_, i) => i !== index);
              handleSizesChange(newSizes);
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
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
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Size
      </button>
    </div>
  );

  // Helper functions to render colors input
  const renderColorsInput = () => (
    <div className="mb-4">
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
          />
          <input
            type="number"
            placeholder="Quantity"
            value={colorObj.quantity}
            onChange={(e) => {
              const newColors = [...formData.colors];
              newColors[index].quantity = parseInt(e.target.value) || 0;
              handleColorsChange(newColors);
            }}
            className="w-1/2 border rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={() => {
              const newColors = formData.colors.filter((_, i) => i !== index);
              handleColorsChange(newColors);
            }}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
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
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Color
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
          />
          <button
            type="button"
            onClick={() => {
              const newSubtitles = formData.subtitle.filter((_, i) => i !== index);
              handleSubtitleChange(newSubtitles);
            }}
            className="px-2 py-1 bg-red-500 text-white rounded"
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
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Subtitle
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
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
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
        />
      </div>
      {/* Display selected files */}
      {selectedFiles.length > 0 && (
        <div className="mb-2">
          <p className="font-semibold">Selected Files:</p>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className=" fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mt-[1000px]">
        <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit}>
                 {/* Product Name */}
                 <div className="mb-4
                 ">
            <label className="block font-semibold mb-2">Product Name</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Codes */}
          {renderArrayInput('Codes', 'code', formData.code)}

          {/* Colors */}
          {renderColorsInput()}

          {/* Sizes */}
          {renderSizesInput()}

          {/* Original Price */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Original Price</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Offer Price */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Offer Price</label>
            <input
              type="number"
              name="offerPrice"
              value={formData.offerPrice}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Titles */}
          {renderArrayInput('Titles', 'title', formData.title)}

          {/* Subtitles */}
          {renderSubtitlesInput()}

          {/* Description */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Images */}
          {renderImagesInput()}

          {/* Buttons */}
          <div className="flex justify-end mt-4">
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
