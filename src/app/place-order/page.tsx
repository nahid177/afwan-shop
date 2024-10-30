// src/app/place-order/page.tsx

"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import Toast from "@/components/Toast/Toast";
import { useRouter } from "next/navigation";

interface OrderFormData {
  customerName: string;
  customerNumber: string;
  otherNumber?: string;
  address1: string;
  address2?: string;
}

const PlaceOrderPage: React.FC = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerNumber: "",
    otherNumber: "",
    address1: "",
    address2: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
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

    // Basic validation
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
      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          product: item.id,
          name: item.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount,
      };

      const response = await axios.post("/api/orders", orderData);

      if (response.status === 201) {
        setToastMessage("Order placed successfully!");
        setToastType("success");
        setToastVisible(true);
        clearCart(); // Clear cart after successful order
        // Redirect to order confirmation page or home
        setTimeout(() => {
          router.push(`/order-confirmation/${response.data.orderId}`);
        }, 2000);
      } else {
        setToastMessage("Failed to place order. Please try again.");
        setToastType("error");
        setToastVisible(true);
      }
    } catch (error: unknown) {
      console.error("Error placing order:", error);
      setToastMessage(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
      setToastType("error");
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Toast Notification */}
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrderPage;
