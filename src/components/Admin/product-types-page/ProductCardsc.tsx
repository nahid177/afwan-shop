import React, { useState, useEffect } from "react";
import { IProduct, IProductType } from "@/types"; // Import IProductType
import Image from "next/image";
import axios from "axios"; // Add AxiosError

interface ProductCardProps {
  product: IProduct;
  orderId: string;
  
}


const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null); // New state for product type
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [productTypes, setProductTypes] = useState<IProductType[]>([]); // State for product types

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get<IProductType[]>("/api/product-types");
        console.log("Fetched product types:", response.data);  // Log the response data for debugging
        setProductTypes(response.data);
      } catch (error) {
        console.error("Error fetching product types:", error);
      }
    };
  
    fetchProductTypes();
  }, []);

  useEffect(() => {
    const calculatedTotal = (product.offerPrice * quantity) - discount;
    setTotalAmount(Math.max(calculatedTotal, 0));
  }, [quantity, discount, product.offerPrice]);

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        customerName,
        customerPhone,
        products: [
          {
            productType: selectedProductType || product.productType, // Use selectedProductType or fallback to product's productType
            productId: product._id,
            productName: product.product_name,
            productCode: product.code[0] || "",
            quantity,
            color: selectedColor,
            size: selectedSize,
            buyingPrice: product.buyingPrice,
            offerPrice: product.offerPrice,
            productImage: product.images[0] || "/placeholder.png",
          },
        ],
        totalAmount,
        discount,
        totalBeforeDiscount: totalAmount + discount,
        status: "open",
        code: `ORD-${new Date().getTime()}`,
        approved: false,
      };

      const response = await axios.post("/api/storeOrders", orderData);
      if (response.status === 201) {
        alert("Order created successfully!");
        
      } else {
        alert("Error creating order.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating store order:", error);
        alert(`Error creating store order: ${error?.response?.data?.message || error.message}`);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred.");
      }
    }
    
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.product_name}</h2>

        {/* Displaying Product Images */}
        <div className="mb-4">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.product_name}
              width={500}
              height={300}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <p>No image available</p>
          )}
        </div>

        {/* Product Type Dropdown */}
        <div className="mb-4">
          <label htmlFor="productType" className="block font-semibold mb-2">Product Type</label>
          <select
            id="productType"
            value={selectedProductType || ''}
            onChange={(e) => setSelectedProductType(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          >
            <option value="">Select Product Type</option>
            {productTypes.length > 0 ? (
              productTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.types_name} 
                </option>
              ))
            ) : (
              <option>No product types available</option>
            )}
          </select>
        </div>

        {/* Size Dropdown */}
        <div className="mb-4">
          <label htmlFor="size" className="block font-semibold mb-2">Size</label>
          <select
            id="size"
            value={selectedSize || ''}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          >
            <option value="">Select Size</option>
            {product.sizes?.map((size) => (
              <option key={size.size} value={size.size}>
                {size.size} ({size.quantity} in stock)
              </option>
            ))}
          </select>
        </div>

        {/* Color Dropdown */}
        <div className="mb-4">
          <label htmlFor="color" className="block font-semibold mb-2">Color</label>
          <select
            id="color"
            value={selectedColor || ''}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          >
            <option value="">Select Color</option>
            {product.colors?.map((color) => (
              <option key={color.color} value={color.color}>
                {color.color} ({color.quantity} in stock)
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Input */}
        <div className="mb-4">
          <label htmlFor="quantity" className="block font-semibold mb-2">Quantity</label>
          <input
            type="number"
            id="quantity"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customerName" className="block font-semibold mb-2">Customer Name</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        {/* Customer Phone */}
        <div className="mb-4">
          <label htmlFor="customerPhone" className="block font-semibold mb-2">Customer Phone</label>
          <input
            type="tel"
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        {/* Discount Input */}
        <div className="mb-4">
          <label htmlFor="discount" className="block font-semibold mb-2">Discount</label>
          <input
            type="number"
            id="discount"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        {/* Total Amount */}
        <div className="mb-4">
          <p className="text-lg font-semibold">Total Amount: ${totalAmount.toFixed(2)}</p>
        </div>

        {/* Confirm Order Button */}
        <button
          onClick={handleCreateOrder}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
