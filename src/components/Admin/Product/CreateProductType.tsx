// src/components/Admin/Product/CreateProductType.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { FiTrash2 } from "react-icons/fi"; // Importing an icon for delete buttons

// Define interfaces for product and category
interface ISubtitle {
  title: string;
  titledetail: string;
}

interface IProduct {
  product_name: string;
  code: string[];
  color: string[];
  size: string[];
  quantity: number;
  originalPrice: number;
  offerPrice: number;
  title: string[]; // Array of strings
  subtitle: ISubtitle[];
  description: string;
  images: string[]; // URLs of uploaded images
  imageFiles?: File[]; // Selected image files to be uploaded (optional)
}

interface IProductCategory {
  catagory_name: string;
  product: IProduct[];
}

const CreateProductType: React.FC = () => {
  const [typesName, setTypesName] = useState<string>("");
  const [productCategories, setProductCategories] = useState<IProductCategory[]>([
    {
      catagory_name: "",
      product: [
        {
          product_name: "",
          code: [""],
          color: [""],
          size: [""],
          quantity: 0,
          originalPrice: 0,
          offerPrice: 0,
          title: [""], // Initialize with an empty string in the array
          subtitle: [{ title: "", titledetail: "" }],
          description: "",
          images: [],
          imageFiles: [],
        },
      ],
    },
  ]);
  const router = useRouter();

  // Custom deep copy function that preserves File instances
  function deepCopyWithFiles<T>(obj: T): T {
    if (obj instanceof File) {
      return obj;
    } else if (Array.isArray(obj)) {
      // Since obj is an array, map over it and deep copy each item
      return obj.map((item) => deepCopyWithFiles(item)) as unknown as T;
    } else if (obj !== null && typeof obj === "object") {
      const copiedObj = {} as { [K in keyof T]: T[K] };
      for (const key in obj) {
        const keyTyped = key as keyof T;
        copiedObj[keyTyped] = deepCopyWithFiles(obj[keyTyped]);
      }
      return copiedObj;
    } else {
      return obj;
    }
  }

  // Handle change for product category
  const handleCategoryChange = (
    index: number,
    field: keyof IProductCategory,
    value: string
  ) => {
    const newCategories = [...productCategories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setProductCategories(newCategories);
  };

  // Handle change for products in a category
  const handleProductChange = (
    catIndex: number,
    prodIndex: number,
    field: keyof IProduct,
    value: IProduct[keyof IProduct]
  ) => {
    const newCategories = [...productCategories];
    const updatedProduct = {
      ...newCategories[catIndex].product[prodIndex],
      [field]: value,
    };
    newCategories[catIndex].product[prodIndex] = updatedProduct;
    setProductCategories(newCategories);
  };

  // Handle change for subtitles in a product
  const handleSubtitleChange = (
    catIndex: number,
    prodIndex: number,
    subIndex: number,
    field: keyof ISubtitle,
    value: string
  ) => {
    const newCategories = [...productCategories];
    const product = newCategories[catIndex].product[prodIndex];
    const updatedSubtitle = { ...product.subtitle[subIndex], [field]: value };
    product.subtitle[subIndex] = updatedSubtitle;
    setProductCategories(newCategories);
  };

  // Handle change for titles in a product
  const handleTitleChange = (
    catIndex: number,
    prodIndex: number,
    titleIndex: number,
    value: string
  ) => {
    const newCategories = [...productCategories];
    newCategories[catIndex].product[prodIndex].title[titleIndex] = value;
    setProductCategories(newCategories);
  };

  // Add a new title to a product
  const addTitle = (catIndex: number, prodIndex: number) => {
    const newCategories = [...productCategories];
    newCategories[catIndex].product[prodIndex].title.push("");
    setProductCategories(newCategories);
  };

  // Remove a title from a product
  const removeTitle = (catIndex: number, prodIndex: number, titleIndex: number) => {
    const newCategories = [...productCategories];
    newCategories[catIndex].product[prodIndex].title.splice(titleIndex, 1);
    setProductCategories(newCategories);
  };

  // Add a new subtitle to a product
  const addSubtitle = (catIndex: number, prodIndex: number) => {
    const newCategories = [...productCategories];
    newCategories[catIndex].product[prodIndex].subtitle.push({
      title: "",
      titledetail: "",
    });
    setProductCategories(newCategories);
  };

  // Remove a subtitle from a product
  const removeSubtitle = (catIndex: number, prodIndex: number, subIndex: number) => {
    const newCategories = [...productCategories];
    newCategories[catIndex].product[prodIndex].subtitle.splice(subIndex, 1);
    setProductCategories(newCategories);
  };

  // Handle adding a new category
  const addCategory = () => {
    setProductCategories([
      ...productCategories,
      {
        catagory_name: "",
        product: [
          {
            product_name: "",
            code: [""],
            color: [""],
            size: [""],
            quantity: 0,
            originalPrice: 0,
            offerPrice: 0,
            title: [""],
            subtitle: [{ title: "", titledetail: "" }],
            description: "",
            images: [],
            imageFiles: [],
          },
        ],
      },
    ]);
  };

  // Handle removing a category
  const removeCategory = (catIndex: number) => {
    const newCategories = [...productCategories];
    newCategories.splice(catIndex, 1);
    setProductCategories(newCategories);
  };

  // Handle adding a new product within a category
  const addProduct = (catIndex: number) => {
    const newCategories = [...productCategories];
    newCategories[catIndex].product.push({
      product_name: "",
      code: [""],
      color: [""],
      size: [""],
      quantity: 0,
      originalPrice: 0,
      offerPrice: 0,
      title: [""],
      subtitle: [{ title: "", titledetail: "" }],
      description: "",
      images: [],
      imageFiles: [],
    });
    setProductCategories(newCategories);
  };

  // Handle removing a product from a category
  const removeProduct = (catIndex: number, prodIndex: number) => {
    const newCategories = [...productCategories];
    newCategories[catIndex].product.splice(prodIndex, 1);
    setProductCategories(newCategories);
  };

  // Handle removing an image from a product
  const removeImage = (catIndex: number, prodIndex: number, imageIndex: number) => {
    const newCategories = [...productCategories];
    const product = newCategories[catIndex].product[prodIndex];
    if (product.imageFiles) {
      product.imageFiles.splice(imageIndex, 1);
      newCategories[catIndex].product[prodIndex] = product;
      setProductCategories(newCategories);
    }
  };

  // Handle image selection
  const handleImageChange = (
    catIndex: number,
    prodIndex: number,
    files: FileList | null
  ) => {
    if (!files) return;

    const newCategories = [...productCategories];
    const product = newCategories[catIndex].product[prodIndex];

    // Combine existing image files with new ones
    const existingFiles = product.imageFiles || [];
    const newFiles = Array.from(files);

    // Enforce maximum of 5 images
    const totalFiles = existingFiles.length + newFiles.length;
    if (totalFiles > 5) {
      alert("You can upload a maximum of 5 images per product.");
      return;
    }

    // Update the product's imageFiles
    product.imageFiles = [...existingFiles, ...newFiles];
    newCategories[catIndex].product[prodIndex] = product;
    setProductCategories(newCategories);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use the custom deep copy function
      const categoriesCopy = deepCopyWithFiles(productCategories);

      // Loop through each category and product to upload images
      for (const category of categoriesCopy) {
        for (const product of category.product) {
          if (product.imageFiles && product.imageFiles.length > 0) {
            const formData = new FormData();
            product.imageFiles.forEach((file: File) => {
              formData.append("files", file);
            });

            // Upload images and get URLs
            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              const imageUrls = data.urls;

              // Update product's images with uploaded URLs
              product.images = imageUrls;
            } else {
              alert("Failed to upload images.");
              return;
            }

            // Remove imageFiles as they are no longer needed
            delete product.imageFiles;
          }
        }
      }

      // Prepare data for submission
      const data = {
        types_name: typesName,
        product_catagory: categoriesCopy,
      };

      const res = await axios.post("/api/product-types", data);
      if (res.status === 201) {
        alert("Product Type created successfully!");
        router.push("/admin/product-types");
      } else {
        alert("Failed to create product type.");
      }
    } catch (error) {
      console.error("Error creating product type:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Create Product Type</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="typesName" className="block text-lg font-medium">
            Product Type Name
          </label>
          <input
            id="typesName"
            type="text"
            className="input input-bordered w-full"
            value={typesName}
            onChange={(e) => setTypesName(e.target.value)}
            required
          />
        </div>

        {/* Loop through each category */}
        {productCategories.map((category, catIndex) => (
          <div key={catIndex} className="border p-4 rounded-lg relative">
            {/* Remove Category Button */}
            <button
              type="button"
              className="absolute top-2 right-2 text-red-500"
              onClick={() => removeCategory(catIndex)}
              title="Remove Category"
            >
              <FiTrash2 size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-2">
              Category {catIndex + 1}
            </h2>
            <div className="form-group">
              <label
                htmlFor={`catagory_name_${catIndex}`}
                className="block text-lg font-medium"
              >
                Category Name
              </label>
              <input
                id={`catagory_name_${catIndex}`}
                type="text"
                className="input input-bordered w-full"
                value={category.catagory_name}
                onChange={(e) =>
                  handleCategoryChange(catIndex, "catagory_name", e.target.value)
                }
                required
              />
            </div>

            {/* Loop through each product in the category */}
            {category.product.map((product, prodIndex) => (
              <div
                key={prodIndex}
                className="border p-4 mt-4 rounded-lg relative"
              >
                {/* Remove Product Button */}
                <button
                  type="button"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => removeProduct(catIndex, prodIndex)}
                  title="Remove Product"
                >
                  <FiTrash2 size={20} />
                </button>

                <h3 className="text-lg font-semibold">
                  Product {prodIndex + 1}
                </h3>

                <div className="form-group">
                  <label
                    htmlFor={`product_name_${catIndex}_${prodIndex}`}
                    className="block text-lg font-medium"
                  >
                    Product Name
                  </label>
                  <input
                    id={`product_name_${catIndex}_${prodIndex}`}
                    type="text"
                    className="input input-bordered w-full"
                    value={product.product_name}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "product_name",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                {/* Product Titles */}
                <div className="form-group">
                  <label className="block text-lg font-medium">Titles</label>
                  {product.title.map((titleItem, titleIndex) => (
                    <div key={titleIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Enter title"
                        value={titleItem}
                        onChange={(e) =>
                          handleTitleChange(
                            catIndex,
                            prodIndex,
                            titleIndex,
                            e.target.value
                          )
                        }
                      />
                      <button
                        type="button"
                        className="ml-2 text-red-500"
                        onClick={() =>
                          removeTitle(catIndex, prodIndex, titleIndex)
                        }
                        title="Remove Title"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {/* Add Title Button */}
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary mt-2"
                    onClick={() => addTitle(catIndex, prodIndex)}
                  >
                    Add Title
                  </button>
                </div>

                {/* Product Codes */}
                <div className="form-group">
                  <label className="block text-lg font-medium">
                    Product Codes
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter product codes (comma separated)"
                    value={product.code.join(", ")}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "code",
                        e.target.value.split(",").map((code) => code.trim())
                      )
                    }
                  />
                </div>

                {/* Product Images */}
                <div className="form-group">
                  <label className="block text-lg font-medium">
                    Product Images
                  </label>
                  <input
                    type="file"
                    className="input input-bordered w-full"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(catIndex, prodIndex, e.target.files)
                    }
                  />
                  {/* Display selected images with remove option */}
                  <div className="flex flex-wrap mt-2">
                    {product.imageFiles &&
                      product.imageFiles.map((file, index) => {
                        const objectUrl = URL.createObjectURL(file);
                        return (
                          <div
                            key={index}
                            className="relative mr-2 mb-2 w-24 h-24"
                          >
                            <Image
                              src={objectUrl}
                              alt={`Selected Image ${index + 1}`}
                              layout="fill"
                              objectFit="cover"
                              onLoad={() => URL.revokeObjectURL(objectUrl)}
                            />
                            {/* Remove Image Button */}
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                              onClick={() =>
                                removeImage(catIndex, prodIndex, index)
                              }
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
                    {product.imageFiles ? product.imageFiles.length : 0} / 5
                    images selected
                  </p>
                </div>

                {/* Colors */}
                <div className="form-group">
                  <label className="block text-lg font-medium">Colors</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter colors (comma separated)"
                    value={product.color.join(", ")}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "color",
                        e.target.value.split(",").map((color) => color.trim())
                      )
                    }
                  />
                </div>

                {/* Sizes */}
                <div className="form-group">
                  <label className="block text-lg font-medium">Sizes</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter sizes (comma separated)"
                    value={product.size.join(", ")}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "size",
                        e.target.value.split(",").map((size) => size.trim())
                      )
                    }
                  />
                </div>

                {/* Quantity */}
                <div className="form-group">
                  <label className="block text-lg font-medium">Quantity</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={product.quantity}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                {/* Original Price */}
                <div className="form-group">
                  <label className="block text-lg font-medium">
                    Original Price
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={product.originalPrice}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "originalPrice",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                {/* Offer Price */}
                <div className="form-group">
                  <label className="block text-lg font-medium">
                    Offer Price
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={product.offerPrice}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "offerPrice",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="block text-lg font-medium">
                    Description
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={product.description}
                    onChange={(e) =>
                      handleProductChange(
                        catIndex,
                        prodIndex,
                        "description",
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>

                {/* Subtitles */}
                <div className="form-group">
                  <label className="block text-lg font-medium">Subtitles</label>
                  {product.subtitle.map((sub, subIndex) => (
                    <div key={subIndex} className="border p-2 rounded mb-2 relative">
                      {/* Remove Subtitle Button */}
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-red-500"
                        onClick={() =>
                          removeSubtitle(catIndex, prodIndex, subIndex)
                        }
                        title="Remove Subtitle"
                      >
                        <FiTrash2 size={16} />
                      </button>
                      <div className="form-group">
                        <label className="block text-sm font-medium">Title</label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={sub.title}
                          onChange={(e) =>
                            handleSubtitleChange(
                              catIndex,
                              prodIndex,
                              subIndex,
                              "title",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium">
                          Title Detail
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={sub.titledetail}
                          onChange={(e) =>
                            handleSubtitleChange(
                              catIndex,
                              prodIndex,
                              subIndex,
                              "titledetail",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                  {/* Add Subtitle Button */}
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary mt-2"
                    onClick={() => addSubtitle(catIndex, prodIndex)}
                  >
                    Add Subtitle
                  </button>
                </div>

                {/* Add more fields as needed */}
              </div>
            ))}

            {/* Button to add another product in the category */}
            <button
              type="button"
              className="btn btn-sm btn-secondary mt-4"
              onClick={() => addProduct(catIndex)}
            >
              Add Another Product
            </button>
          </div>
        ))}

        {/* Button to add another category */}
        <button
          type="button"
          className="btn btn-sm btn-secondary mt-4"
          onClick={addCategory}
        >
          Add Another Category
        </button>

        <button type="submit" className="btn btn-primary">
          Create Product Type
        </button>
      </form>
    </div>
  );
};

export default CreateProductType;
