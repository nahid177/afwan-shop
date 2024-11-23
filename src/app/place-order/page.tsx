// src/app/place-order/page.tsx

"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import Toast from "@/components/Toast/Toast";
import { useRouter } from "next/navigation";
import { useTheme, ThemeProvider } from "@/mode/ThemeContext"; // Import useTheme and ThemeProvider

interface OrderFormData {
  customerName: string;
  customerNumber: string;
  otherNumber?: string;
  address1: string;
  address2?: string;
}

const PlaceOrderPage: React.FC = () => {
  const { theme } = useTheme(); // Get the current theme
  const { cartItems, totalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerNumber: "",
    otherNumber: "",
    address1: "",
    address2: "",
  });

  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerNumber || !formData.address1) {
      setToastMessage("Please fill in all required fields.");
      setToastType("error");
      setToastVisible(true);
      return;
    }

    if (cartItems.length === 0) {
      setToastMessage("Your cart is empty.");
      setToastType("warning");
      setToastVisible(true);
      return;
    }

    setLoading(true);

    try {
      // Add a console log to verify cart items
      console.log("Cart Items Before Submission:", cartItems);

      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          product: item.id,
          name: item.name,              // Ensure name is included
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: item.price,            // Ensure price is included
          // Remove buyingPrice and imageUrl as backend handles them
        })),
        totalAmount,
      };

      console.log("Submitting order data:", orderData); // Debugging

      const response = await axios.post("/api/orders", orderData);

      if (response.status === 201) {
        setToastMessage("Order placed successfully!");
        setToastType("success");
        setToastVisible(true);
        clearCart();

        setTimeout(() => {
          router.push(`/order-confirmation/${response.data.orderId}`);
        }, 2000);
      } else {
        setToastMessage("Failed to place order. Please try again.");
        setToastType("error");
        setToastVisible(true);
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      setToastMessage(error.response?.data?.message || "An unexpected error occurred.");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div
        className={`min-h-screen p-6 ${
          theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        {toastVisible && (
          <div className="fixed top-4 right-4 z-50">
            <Toast
              type={toastType}
              message={toastMessage}
              onClose={() => setToastVisible(false)}
            />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-6">Place Your Order</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium">
              Customer Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                theme === "light"
                  ? "border-gray-300 bg-white text-black"
                  : "border-gray-700 bg-gray-800 text-white"
              }`}
            />
          </div>

          {/* Customer Number */}
          <div>
            <label htmlFor="customerNumber" className="block text-sm font-medium">
              Customer Number<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="customerNumber"
              name="customerNumber"
              value={formData.customerNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10,15}"
              title="Please enter a valid phone number."
              className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                theme === "light"
                  ? "border-gray-300 bg-white text-black"
                  : "border-gray-700 bg-gray-800 text-white"
              }`}
            />
          </div>

          {/* Other Number */}
          <div>
            <label htmlFor="otherNumber" className="block text-sm font-medium">
              Other Number
            </label>
            <input
              type="tel"
              id="otherNumber"
              name="otherNumber"
              value={formData.otherNumber}
              onChange={handleChange}
              pattern="[0-9]{10,15}"
              title="Please enter a valid phone number."
              className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                theme === "light"
                  ? "border-gray-300 bg-white text-black"
                  : "border-gray-700 bg-gray-800 text-white"
              }`}
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="address1" className="block text-sm font-medium">
              Address Line 1<span className="text-red-500">*</span>
            </label>
            <textarea
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              required
              rows={3}
              className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                theme === "light"
                  ? "border-gray-300 bg-white text-black"
                  : "border-gray-700 bg-gray-800 text-white"
              }`}
            ></textarea>
          </div>

          {/* Address Line 2 */}
          <div>
            <label htmlFor="address2" className="block text-sm font-medium">
              Address Line 2
            </label>
            <textarea
              id="address2"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                theme === "light"
                  ? "border-gray-300 bg-white text-black"
                  : "border-gray-700 bg-gray-800 text-white"
              }`}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md transition-transform disabled:opacity-50 btn-gradient-blue`}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </ThemeProvider>
  );
};

export default PlaceOrderPage;
