"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Subtitle {
  title: string;
  titledetail: string;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface Product {
  _id: string;
  product_name: string;
  code: string[];
  color: string[];
  sizes: SizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: Subtitle[];
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CategoryProductsPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const categoryName = params.categoryName as string;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await axios.get(
          `/api/product-types/${id}/categories/${categoryName}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id, categoryName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">
        Products in &quot;{categoryName.replace(/-/g, " ")}&quot;
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Image
              src={product.images[0] || "/placeholder.png"}
              alt={product.product_name}
              width={300}
              height={200}
              className="w-full h-48 object-cover mb-4 rounded"
            />
            <h3 className="text-lg font-medium mb-2">{product.product_name}</h3>
            <p className="text-gray-600 mb-2">
              {product.description.substring(0, 80)}...
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-blue-500 font-semibold">
                TK. {product.offerPrice.toFixed(2)}
              </span>
              {product.originalPrice > product.offerPrice && (
                <span className="line-through text-gray-500">
                  TK. {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Link href={`/products/details/${product._id}`}>
              <span className="block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 cursor-pointer">
                View Details
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
