import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useTheme } from "@/mode/ThemeContext"; // Import the theme context
import Link from "next/link"; // Import Link to navigate to product details

interface Product {
  _id: string;
  product_name: string;
  offerPrice: number;
  originalPrice: number;
  images: string[];
}

interface OtherProductsProps {
  categoryName: string;
  id: string;
}

const OtherProducts: React.FC<OtherProductsProps> = ({ categoryName, id }) => {
  const { theme } = useTheme(); // Use the theme from the context
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOtherProducts = async () => {
      try {
        const response = await axios.get(
          `/api/product-types/${id}/categories/${categoryName}/products`
        );
        setOtherProducts(response.data);
      } catch (err: unknown) { // Use 'unknown' instead of 'any'
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to fetch other products.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOtherProducts();
  }, [categoryName, id]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading other products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`mt-10 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      <h3 className="text-2xl font-semibold mb-4 text-center">Other Products You May Like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {otherProducts.map((product) => (
          <div key={product._id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
            <Image
              src={product.images[0] || "/placeholder.png"}
              alt={product.product_name}
              width={200}
              height={200}
              className="object-cover rounded-lg"
            />
            <h4 className="text-sm font-semibold mt-4">{product.product_name}</h4>
            <div className="flex gap-2 items-center">
              <p className="text-lg text-red-500">{product.offerPrice}৳</p>
              {product.originalPrice && product.originalPrice > product.offerPrice && (
                <p className="text-sm text-gray-500 line-through">{product.originalPrice}৳</p>
              )}
            </div>
            <Link href={`/products/details/${id}/${categoryName}/${product._id}`}>
              <button
                className="btn-gradient-blue text-sm flex items-center justify-center w-full py-2 px-4 rounded-lg transition-transform hover:scale-105 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherProducts;
