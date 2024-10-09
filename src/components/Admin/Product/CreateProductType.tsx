"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
  images: string[];
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
          images: [""],
        },
      ],
    },
  ]);
  const router = useRouter();

  // Handle change for product category
  const handleCategoryChange = (index: number, field: keyof IProductCategory, value: string) => {
    const newCategories = [...productCategories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setProductCategories(newCategories);
  };

  // Handle change for products in a category
  const handleProductChange = (catIndex: number, prodIndex: number, field: keyof IProduct, value: string | string[]) => {
    const newCategories = [...productCategories];
    const updatedProduct = { ...newCategories[catIndex].product[prodIndex], [field]: value };
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
            images: [""],
          },
        ],
      },
    ]);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      types_name: typesName,
      product_catagory: productCategories,
    };

    try {
      const res = await axios.post("/api/product-types", data);
      if (res.status === 201) {
        alert("Product Type created successfully!");
        router.push("/admin/products");
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
            <h2 className="text-xl font-semibold mb-2">Category {catIndex + 1}</h2>
            <div className="form-group">
              <label htmlFor={`catagory_name_${catIndex}`} className="block text-lg font-medium">
                Category Name
              </label>
              <input
                id={`catagory_name_${catIndex}`}
                type="text"
                className="input input-bordered w-full"
                value={category.catagory_name}
                onChange={(e) => handleCategoryChange(catIndex, "catagory_name", e.target.value)}
                required
              />
            </div>

            {/* Loop through each product in the category */}
            {category.product.map((product, prodIndex) => (
              <div key={prodIndex} className="border p-4 mt-4 rounded-lg">
                <h3 className="text-lg font-semibold">Product {prodIndex + 1}</h3>

                <div className="form-group">
                  <label htmlFor={`product_name_${prodIndex}`} className="block text-lg font-medium">
                    Product Name
                  </label>
                  <input
                    id={`product_name_${prodIndex}`}
                    type="text"
                    className="input input-bordered w-full"
                    value={product.product_name}
                    onChange={(e) =>
                      handleProductChange(catIndex, prodIndex, "product_name", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Product Codes */}
                <div className="form-group">
                  <label className="block text-lg font-medium">Product Codes</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter product codes (comma separated)"
                    value={product.code.join(", ")}
                    onChange={(e) =>
                      handleProductChange(catIndex, prodIndex, "code", e.target.value.split(", "))
                    }
                  />
                </div>

                {/* Additional fields like color, size, quantity, price */}
                {/* You can loop through similar fields like subtitle or image here */}
              </div>
            ))}

            <button
              type="button"
              className="btn btn-sm btn-secondary mt-4"
              onClick={addCategory}
            >
              Add Another Category
            </button>
          </div>
        ))}

        <button type="submit" className="btn btn-primary">
          Create Product Type
        </button>
      </form>
    </div>
  );
};

export default CreateProductType;
