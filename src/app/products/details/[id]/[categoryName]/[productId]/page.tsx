"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/mode/ThemeContext"; // Import the theme context

interface Product {
  _id: string;
  product_name: string;
  code: string[];
  color: string[];
  sizes: { size: string; quantity: number }[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: { title: string; titledetail: string }[];
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productResponse = await axios.get(`/api/product-types/${id}/categories/${categoryName}/products/${productId}`);
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
    <div className={`w-full mx-auto px-4 py-6 ${theme === 'light' ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Images */}
        <div className="lg:w-2/3">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.product_name}
            width={600}
            height={600}
            className="object-cover rounded-lg"
          />
          <div className="grid grid-cols-5 gap-2 mt-4">
            {product.images.map((image, index) => (
              <Image
                key={index}
                src={image || "/placeholder.png"}
                alt={`Product image ${index + 1}`}
                width={100}
                height={100}
                className="object-cover rounded-lg cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-bold mb-4">{product.product_name}</h2>
          <p className="text-xl font-semibold text-red-500 mb-2">
            Tk. {product.offerPrice}{" "}
            <span className="line-through text-gray-500">Tk. {product.originalPrice}</span>
          </p>
          <p className="mb-4">
            Color: {product.color?.join(", ") || "N/A"} | Sizes: {product.sizes?.map(size => size.size).join(", ") || "N/A"}
          </p>
          <div className="flex gap-4 mb-4">
            <button className="btn-gradient-blue px-4 py-2 rounded-lg">Add to Cart</button>
            <button className="bg-black text-white px-4 py-2 rounded-lg">Buy Now</button>
          </div>

          {/* Description */}
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="mb-4">{product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
