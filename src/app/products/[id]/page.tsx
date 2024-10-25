// /app/products/[id]/page.tsx

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

interface ProductCategory {
  _id: string;
  catagory_name: string;
  product: Product[];
}

interface ProductType {
  _id: string;
  types_name: string;
  product_catagory: ProductCategory[];
}

const ProductTypePage: React.FC = () => {
  const { id } = useParams();
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductType = async () => {
      try {
        const response = await axios.get(`/api/product-types/${id}`);
        setProductType(response.data);
      } catch (error) {
        console.error("Error fetching product type:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductType();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!productType) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Product type not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{productType.types_name}</h1>
      {productType.product_catagory.map((category) => (
        <div key={category._id} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            {category.catagory_name}
          </h2>
          {category.product.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.product.map((product) => (
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
                  <h3 className="text-lg font-medium mb-2">
                    {product.product_name}
                  </h3>
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
          ) : (
            <p className="text-gray-600">
              No products available under this category.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductTypePage;
