import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ProductCard from "@/components/ProductCard"; // Import the newly created ProductCard component
import { useTheme } from "@/mode/ThemeContext"; // Use the theme context
import { useCart } from "@/context/CartContext"; // Import the cart context
import Toast from "@/components/Toast/Toast"; // Import the Toast component

interface Product {
  _id: string;
  product_name: string;
  offerPrice: number;
  originalPrice: number;
  images: string[];
  colors?: { color: string }[];
  sizes?: { size: string; quantity: number }[];
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

const ProductsPage: React.FC = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get("/api/product-types");
        setProductTypes(response.data);
      } catch (error) {
        console.error("Error fetching product types:", error);
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  const triggerToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto px-4 py-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      {/* Toast Component */}
      {toast && (
        <div className="fixed top-0 right-0 m-4 space-y-2 z-50">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

    

      {productTypes.length > 0 ? (
        productTypes.map((productType) => (
          <div key={productType._id} className="mb-8">
            <h2 className="text-2xl font-semibold text-center mb-4 relative">
              {/* Underline Animation */}
              <span className="relative inline-block">
                {productType.types_name}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth">
              {/* Flatten all products under product categories */}
              {productType.product_catagory.flatMap((category) => category.product).length > 0 ? (
                productType.product_catagory.flatMap((category) => category.product).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    productType={productType}
                    addToCart={addToCart}
                    triggerToast={triggerToast}
                  />
                ))
              ) : (
                <p className="text-gray-500">No products available in this type.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No product types available.</p>
      )}
    </div>
  );
};

export default ProductsPage;
