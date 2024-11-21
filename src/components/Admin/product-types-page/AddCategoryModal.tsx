// src/components/Admin/product-types-page/AddCategoryModal.tsx

import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiTrash2 } from 'react-icons/fi';
import { IProduct, ISizeQuantity, ISubtitle, IColorQuantity, IProductCategory } from '@/types';
import { FaTimes } from 'react-icons/fa'; // Import Close Icon

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTypeId: string;
  onCategoryAdded: (newCategory: IProductCategory) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  productTypeId,
  onCategoryAdded,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [products, setProducts] = useState<IProduct[]>([
    {
      product_name: '',
      code: [''],
      colors: [{ color: '', quantity: 0 }],
      sizes: [{ size: '', quantity: 0 }],
      originalPrice: 0,
      offerPrice: 0,
      buyingPrice: 0, // Initialize buyingPrice
      title: [''],
      subtitle: [{ title: '', titledetail: '' }],
      description: '',
      images: [],
      imageFiles: [],
    },
  ]);

  // Handle changes to products
  const handleProductChange = <K extends keyof IProduct>(
    index: number,
    field: K,
    value: IProduct[K]
  ) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value,
    };
    setProducts(newProducts);
  };

  // Handle size changes
  const handleSizeChange = <K extends keyof ISizeQuantity>(
    productIndex: number,
    sizeIndex: number,
    field: K,
    value: ISizeQuantity[K]
  ) => {
    const newProducts = [...products];
    const sizes = [...newProducts[productIndex].sizes];
    sizes[sizeIndex] = {
      ...sizes[sizeIndex],
      [field]: value,
    };
    newProducts[productIndex] = {
      ...newProducts[productIndex],
      sizes,
    };
    setProducts(newProducts);
  };

  // Handle color changes
  const handleColorChange = <K extends keyof IColorQuantity>(
    productIndex: number,
    colorIndex: number,
    field: K,
    value: IColorQuantity[K]
  ) => {
    const newProducts = [...products];
    const colors = [...newProducts[productIndex].colors];
    colors[colorIndex] = {
      ...colors[colorIndex],
      [field]: value,
    };
    newProducts[productIndex] = {
      ...newProducts[productIndex],
      colors,
    };
    setProducts(newProducts);
  };

  // Add new product field
  const addProductField = () => {
    setProducts([
      ...products,
      {
        product_name: '',
        code: [''],
        colors: [{ color: '', quantity: 0 }],
        sizes: [{ size: '', quantity: 0 }],
        originalPrice: 0,
        offerPrice: 0,
        buyingPrice: 0, // Initialize buyingPrice for new product
        title: [''],
        subtitle: [{ title: '', titledetail: '' }],
        description: '',
        images: [],
        imageFiles: [],
      },
    ]);
  };

  // Add new size field
  const addSizeField = (productIndex: number) => {
    const newProducts = [...products];
    const sizes = [...newProducts[productIndex].sizes, { size: '', quantity: 0 }];
    newProducts[productIndex] = {
      ...newProducts[productIndex],
      sizes,
    };
    setProducts(newProducts);
  };

  // Add new color field
  const addColorField = (productIndex: number) => {
    const newProducts = [...products];
    const colors = [...newProducts[productIndex].colors, { color: '', quantity: 0 }];
    newProducts[productIndex] = {
      ...newProducts[productIndex],
      colors,
    };
    setProducts(newProducts);
  };

  // Handle image selection
  const handleImageChange = (productIndex: number, files: FileList | null) => {
    if (!files) return;

    const newProducts = [...products];
    const product = newProducts[productIndex];

    // Combine existing image files with new ones
    const existingFiles = product.imageFiles || [];
    const newFiles = Array.from(files);

    // Enforce maximum of 5 images
    const totalFiles = existingFiles.length + newFiles.length;
    if (totalFiles > 5) {
      alert('You can upload a maximum of 5 images per product.');
      return;
    }

    // Update the product's imageFiles
    product.imageFiles = [...existingFiles, ...newFiles];
    newProducts[productIndex] = product;
    setProducts(newProducts);
  };

  // Remove selected image
  const removeImage = (productIndex: number, imageIndex: number) => {
    const newProducts = [...products];
    const product = newProducts[productIndex];
    if (product.imageFiles) {
      product.imageFiles.splice(imageIndex, 1);
      newProducts[productIndex] = product;
      setProducts(newProducts);
    }
  };

  // Custom deep copy function that preserves File instances
  function deepCopyWithFiles<T>(obj: T): T {
    if (obj instanceof File) {
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map((item) => deepCopyWithFiles(item)) as unknown as T;
    } else if (obj !== null && typeof obj === 'object') {
      const copiedObj = {} as { [K in keyof T]: T[K] };
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const keyTyped = key as keyof T;
          copiedObj[keyTyped] = deepCopyWithFiles(obj[keyTyped]);
        }
      }
      return copiedObj;
    } else {
      return obj;
    }
  }

  const handleSubmit = async () => {
    try {
      if (categoryName.trim() === '') {
        alert('Category name is required.');
        return;
      }

      // Validate products
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        if (product.product_name.trim() === '') {
          alert(`Product ${index + 1}: Product name is required.`);
          return;
        }
        if (product.originalPrice < 0) {
          alert(`Product ${index + 1}: Original price cannot be negative.`);
          return;
        }
        if (product.offerPrice < 0) {
          alert(`Product ${index + 1}: Offer price cannot be negative.`);
          return;
        }
        if (product.buyingPrice < 0) {
          alert(`Product ${index + 1}: Buying price cannot be negative.`);
          return;
        }
        // Add more validations as needed
      }

      const newCategory: IProductCategory = {
        catagory_name: categoryName,
        product: products,
      };

      // Use the custom deep copy function
      const categoryCopy = deepCopyWithFiles(newCategory);

      // Loop through each product to upload images
      await Promise.all(
        categoryCopy.product.map(async (product) => {
          if (product.imageFiles && product.imageFiles.length > 0) {
            const formData = new FormData();
            product.imageFiles.forEach((file: File) => {
              formData.append('files', file);
            });

            // Upload images and get URLs
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              const imageUrls: string[] = data.urls;

              // Update product's images with uploaded URLs
              product.images = imageUrls;
            } else {
              throw new Error('Failed to upload images.');
            }

            // Remove imageFiles as they are no longer needed
            delete product.imageFiles;
          }
        })
      );

      // Prepare data for submission
      const data = {
        product_catagory: [categoryCopy],
      };

      const res = await axios.patch(`/api/product-types/${productTypeId}`, data);

      if (res.status === 200) {
        onCategoryAdded(categoryCopy);
        onClose();
      } else {
        alert('Failed to add category.');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('An error occurred while adding the category.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg max-w-2xl w-full overflow-y-auto max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Category</h2>
          <button
            className="text-gray-700 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Category Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>

        {/* Products */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Products</label>
          {products.map((product, index) => (
            <div key={index} className="mb-6 border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">Product {index + 1}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                {/* Product Name */}
                <div>
                  <label className="block font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={product.product_name}
                    onChange={(e) =>
                      handleProductChange(index, 'product_name', e.target.value)
                    }
                  />
                </div>
                {/* Original Price */}
                <div>
                  <label className="block font-semibold mb-1">Original Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border px-3 py-2 rounded"
                    value={product.originalPrice}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        'originalPrice',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                {/* Offer Price */}
                <div>
                  <label className="block font-semibold mb-1">Offer Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border px-3 py-2 rounded"
                    value={product.offerPrice}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        'offerPrice',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                {/* Buying Price */}
                <div>
                  <label className="block font-semibold mb-1">Buying Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border px-3 py-2 rounded"
                    value={product.buyingPrice}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        'buyingPrice',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    className="w-full border px-3 py-2 rounded"
                    value={product.description}
                    onChange={(e) =>
                      handleProductChange(index, 'description', e.target.value)
                    }
                  />
                </div>
                {/* Codes */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">
                    Codes (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={product.code.join(', ')}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        'code',
                        e.target.value.split(',').map((code) => code.trim())
                      )
                    }
                  />
                </div>
                {/* Titles */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">
                    Titles (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={product.title.join(', ')}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        'title',
                        e.target.value.split(',').map((title) => title.trim())
                      )
                    }
                  />
                </div>
                {/* Subtitles */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Subtitles</label>
                  <div className="space-y-2">
                    {product.subtitle.map((subtitle, subIndex) => (
                      <div key={subIndex} className="border p-2 rounded">
                        <input
                          type="text"
                          placeholder="Subtitle Title"
                          className="w-full border px-2 py-1 rounded mb-1"
                          value={subtitle.title}
                          onChange={(e) => {
                            const newSubtitles = [...product.subtitle];
                            newSubtitles[subIndex] = {
                              ...newSubtitles[subIndex],
                              title: e.target.value,
                            };
                            handleProductChange(index, 'subtitle', newSubtitles);
                          }}
                        />
                        <textarea
                          placeholder="Subtitle Detail"
                          className="w-full border px-2 py-1 rounded"
                          value={subtitle.titledetail}
                          onChange={(e) => {
                            const newSubtitles = [...product.subtitle];
                            newSubtitles[subIndex] = {
                              ...newSubtitles[subIndex],
                              titledetail: e.target.value,
                            };
                            handleProductChange(index, 'subtitle', newSubtitles);
                          }}
                        />
                        {/* Remove Subtitle Button */}
                        {product.subtitle.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newSubtitles = [...product.subtitle];
                              newSubtitles.splice(subIndex, 1);
                              handleProductChange(index, 'subtitle', newSubtitles);
                            }}
                            className="mt-2 text-red-600 hover:underline"
                          >
                            Remove Subtitle
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newSubtitles = [
                          ...product.subtitle,
                          { title: '', titledetail: '' },
                        ];
                        handleProductChange(index, 'subtitle', newSubtitles);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      + Add Another Subtitle
                    </button>
                  </div>
                </div>
                {/* Images */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Product Images</label>
                  <input
                    type="file"
                    className="w-full border px-3 py-2 rounded"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e.target.files)}
                  />
                  {/* Display selected images with remove option */}
                  <div className="flex flex-wrap mt-2">
                    {product.imageFiles &&
                      product.imageFiles.map((file, idx) => {
                        const objectUrl = URL.createObjectURL(file);
                        return (
                          <div key={idx} className="relative mr-2 mb-2 w-24 h-24">
                            <Image
                              src={objectUrl}
                              alt={`Selected Image ${idx + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded"
                              onLoad={() => URL.revokeObjectURL(objectUrl)}
                            />
                            {/* Remove Image Button */}
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                              onClick={() => removeImage(index, idx)}
                              title="Remove Image"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  {/* Display number of images selected */}
                  <p className="text-sm text-gray-500">
                    {product.imageFiles ? product.imageFiles.length : 0} / 5 images selected
                  </p>
                </div>
              </div>
              {/* Sizes */}
              <div className="mb-2">
                <label className="block font-semibold mb-1">Sizes & Quantities</label>
                {product.sizes.map((sizeItem, sizeIndex) => (
                  <div key={sizeIndex} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Size"
                      className="w-1/2 border px-3 py-2 rounded"
                      value={sizeItem.size}
                      onChange={(e) =>
                        handleSizeChange(index, sizeIndex, 'size', e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Quantity"
                      className="w-1/2 border px-3 py-2 rounded"
                      value={sizeItem.quantity}
                      onChange={(e) =>
                        handleSizeChange(
                          index,
                          sizeIndex,
                          'quantity',
                          parseInt(e.target.value, 10)
                        )
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSizeField(index)}
                  className="text-blue-600 hover:underline"
                >
                  + Add Another Size
                </button>
              </div>

              {/* Colors */}
              <div className="mb-2">
                <label className="block font-semibold mb-1">Colors & Quantities</label>
                {product.colors.map((colorItem, colorIndex) => (
                  <div key={colorIndex} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Color"
                      className="w-1/2 border px-3 py-2 rounded"
                      value={colorItem.color}
                      onChange={(e) =>
                        handleColorChange(index, colorIndex, 'color', e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Quantity"
                      className="w-1/2 border px-3 py-2 rounded"
                      value={colorItem.quantity}
                      onChange={(e) =>
                        handleColorChange(
                          index,
                          colorIndex,
                          'quantity',
                          parseInt(e.target.value, 10)
                        )
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addColorField(index)}
                  className="text-blue-600 hover:underline"
                >
                  + Add Another Color
                </button>
              </div>
            </div>
          ))}
          <button onClick={addProductField} className="text-blue-600 hover:underline mt-2">
            + Add Another Product
          </button>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
