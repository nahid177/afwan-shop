import React from "react";
import { IProduct } from "@/types";

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number | undefined) => {
    if (typeof price === "number" && !isNaN(price)) {
      return price.toFixed(2);
    }
    return "0.00"; // Default value if price is not a valid number
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.product_name}</h2>

        {/* Displaying Only Required Information */}
        <p className="text-gray-700 mb-2">
          <strong>Code:</strong> {Array.isArray(product.code) ? product.code.join(", ") : "N/A"}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Buying Price:</strong> ${formatPrice(product.buyingPrice)}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Original Price:</strong> ${formatPrice(product.originalPrice)}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Offer Price:</strong> ${formatPrice(product.offerPrice)}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Total Quantity:</strong> {product.totalQuantity ?? "N/A"}
        </p>
      </div>
    </div>
  );
};


export default ProductCard;
