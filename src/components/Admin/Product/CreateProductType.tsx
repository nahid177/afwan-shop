// src/components/Admin/Product/CreateProductType.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

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
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[]; // URLs of uploaded images
  imageFiles?: File[]; // Selected image files to be uploaded (now optional)
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
          title: [""],
          subtitle: [{ title: "", titledetail: "" }],
          description: "",
          images: [],
          imageFiles: [], // This can remain as an empty array in the initial state
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
          <div key={catIndex} className="border p-4 rounded-lg">
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
              <div key={prodIndex} className="border p-4 mt-4 rounded-lg">
                <h3 className="text-lg font-semibold">
                  Product {prodIndex + 1}
                </h3>

                <div className="form-group">
                  <label
                    htmlFor={`product_name_${prodIndex}`}
                    className="block text-lg font-medium"
                  >
                    Product Name
                  </label>
                  <input
                    id={`product_name_${prodIndex}`}
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
                  {/* Display selected images */}
                  <div className="flex space-x-2 mt-2">
                    {product.imageFiles &&
                      product.imageFiles.map((file, index) => {
                        const objectUrl = URL.createObjectURL(file);
                        return (
                          <Image
                            key={index}
                            src={objectUrl}
                            alt={`Selected Image ${index + 1}`}
                            width={100}
                            height={100}
                            onLoad={() => URL.revokeObjectURL(objectUrl)}
                          />
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

                {/* Add more fields as needed */}
              </div>
            ))}

            {/* Button to add another product in the category */}
            <button
              type="button"
              className="btn btn-sm btn-secondary mt-4"
              onClick={() => {
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
              }}
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
