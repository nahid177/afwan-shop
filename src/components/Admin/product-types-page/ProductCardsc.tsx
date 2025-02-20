import React from "react";
import { IProduct } from "@/types";
import Image from "next/image"; // Importing Image component from Next.js

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

        {/* Displaying Product Images */}
        <div className="mb-4">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]} // Use the first image (you can implement a carousel for multiple images)
              alt={product.product_name}
              width={500} // Define width (or use a dynamic value)
              height={300} // Define height (or use a dynamic value)
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <p>No image available</p>
          )}
        </div>

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

        {/* Displaying Quantity by Color */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-4">
            <strong>Quantity by Color:</strong>
            <ul>
              {product.colors.map((color, index) => (
                <li key={index} className="text-gray-700">
                  {color.color}: {color.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Displaying Quantity by Size */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <strong>Quantity by Size:</strong>
            <ul>
              {product.sizes.map((size, index) => (
                <li key={index} className="text-gray-700">
                  {size.size}: {size.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
