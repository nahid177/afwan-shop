"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/mode/ThemeContext"; // Import the theme context

interface ColorQuantity {
  color: string;
  quantity: number;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface Subtitle {
  title: string;
  titledetail: string;
}

interface Product {
  _id: string;
  product_name: string;
  code: string[];
  colors: ColorQuantity[];
  sizes: SizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: Subtitle[];
  description: string;
  images: string[];
}

const ProductDetailsPage: React.FC = () => {
  const { theme } = useTheme(); // Use the theme from the context
  const params = useParams();
  const productId = params.productId as string; // Extract productId from params
  const id = params.id as string; // Extract product type id
  const categoryName = params.categoryName as string; // Extract category name

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State to keep track of the selected image index
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productResponse = await axios.get(
          `/api/product-types/${id}/categories/${categoryName}/products/${productId}`
        );
        setProduct(productResponse.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, id, categoryName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No product details found.</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full mx-auto px-4 py-6 ${
        theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Images */}
        <div className="lg:w-2/4">
          {/* Main Image */}
          <Image
            src={product.images[selectedImageIndex] || "/placeholder.png"}
            alt={product.product_name}
            width={800}
            height={800}
            className="object-cover rounded-lg"
          />
          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {product.images.map((image, index) => (
              <div key={index} className="cursor-pointer">
                <Image
                  src={image || "/placeholder.png"}
                  alt={`Product image ${index + 1}`}
                  width={100}
                  height={100}
                  className={`object-cover rounded-lg ${
                    index === selectedImageIndex
                      ? "border-2 border-blue-500"
                      : "border"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-bold mb-4">{product.product_name}</h2>
          <p className="text-xl font-semibold text-red-500 mb-2">
            Tk. {product.offerPrice}{" "}
            <span className="line-through text-gray-500">
              Tk. {product.originalPrice}
            </span>
          </p>

          {/* Colors */}
          <p className="mb-4">
            <strong>Available Colors: </strong>
            {product.colors?.length > 0 ? (
              <span>
                {product.colors.map((colorItem) => colorItem.color).join(", ")}
              </span>
            ) : (
              <span>N/A</span>
            )}
          </p>

          {/* Sizes */}
          <p className="mb-4">
            <strong>Available Sizes: </strong>
            {product.sizes?.length > 0
              ? product.sizes.map((sizeItem, index) => (
                  <span
                    key={index}
                    className="mr-2 text-sm px-2 py-1 border rounded-lg"
                  >
                    {sizeItem.size} ({sizeItem.quantity} left)
                  </span>
                ))
              : "N/A"}
          </p>

          {/* Actions */}
          <div className="flex gap-4 mb-4">
            <button className="btn-gradient-blue px-4 py-2 rounded-lg">
              Add to Cart
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Buy Now
            </button>
          </div>

          {/* Description */}
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="mb-4">{product.description}</p>

          {/* Titles */}
          {product.title?.length > 0 && (
            <div className="mb-4">
              <strong>Titles:</strong>
              <ul className="list-disc ml-4">
                {product.title.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Subtitles */}
          {product.subtitle?.length > 0 && (
            <div className="mb-4">
              <strong>Subtitles:</strong>
              <ul className="list-disc ml-4">
                {product.subtitle.map((subItem, index) => (
                  <li key={index}>
                    <strong>{subItem.title}</strong>: {subItem.titledetail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
