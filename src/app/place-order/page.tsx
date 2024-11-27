"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import Toast from "@/components/Toast/Toast";
import { useRouter } from "next/navigation";
import { useTheme, ThemeProvider } from "@/mode/ThemeContext";
import Image from "next/image";

interface OrderFormData {
  customerName: string;
  customerNumber: string;
  otherNumber?: string;
  address1: string;
  address2?: string;
  deliveryArea: string;
  promoCode?: string;
}

const PlaceOrderPage: React.FC = () => {
  const { theme } = useTheme();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerNumber: "",
    otherNumber: "",
    address1: "",
    address2: "",
    deliveryArea: "",
    promoCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [deliveryAreas, setDeliveryAreas] = useState<{ area: string; price: number }[]>([]);
  const [discount, setDiscount] = useState<number>(0); // Discount value
  const router = useRouter();

  useEffect(() => {
    const fetchDeliveryAreas = async () => {
      try {
        const response = await axios.get("/api/delivery-areas");
        setDeliveryAreas(response.data.deliveryAreas);
      } catch (error) {
        console.error("Error fetching delivery areas", error);
      }
    };
    fetchDeliveryAreas();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotalAmount = () => {
    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryArea = deliveryAreas.find((area) => area.area === formData.deliveryArea);
    const deliveryPrice = deliveryArea ? deliveryArea.price : 0;
    const discountAmount = (cartTotal + deliveryPrice) * (discount / 100);
    return cartTotal + deliveryPrice - discountAmount;
  };

  const handlePromoCodeValidation = async () => {
    if (!formData.promoCode) {
      setToastMessage("Please enter a promo code.");
      setToastType("warning");
      setToastVisible(true);
      return;
    }

    try {
      const response = await axios.post("/api/validate-promo-code", { code: formData.promoCode });
      if (response.status === 200 && response.data.isValid) {
        setDiscount(response.data.discountValue);
        setToastMessage(`Promo code applied! Discount: ${response.data.discountValue}%`);
        setToastType("success");
      } else {
        setDiscount(0);
        setToastMessage("Invalid promo code.");
        setToastType("error");
      }
      setToastVisible(true);
    } catch (error) {
      setToastMessage("An error occurred while validating the promo code.");
      setToastType("error");
      setToastVisible(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerNumber || !formData.address1 || !formData.deliveryArea) {
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
        totalAmount: calculateTotalAmount(),
      };

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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setToastMessage(error.response?.data?.message || "An unexpected error occurred.");
      } else {
        setToastMessage("An unexpected error occurred.");
      }
      setToastType("error");
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div
        className={`min-h-screen p-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
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



        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="mt-1 block w-full border rounded-md shadow-sm"
            />
          </div>

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
              className="mt-1 block w-full border rounded-md shadow-sm"
            />
          </div>

          {/* Other Number */}
          <div>
            <label htmlFor="otherNumber" className="block text-sm font-medium">
              Other Number (optional)
            </label>
            <input
              type="tel"
              id="otherNumber"
              name="otherNumber"
              value={formData.otherNumber || ""}
              onChange={handleChange}
              pattern="[0-9]{10,15}"
              className="mt-1 block w-full border rounded-md shadow-sm"
            />
          </div>

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
              className="mt-1 block w-full border rounded-md shadow-sm"
            ></textarea>
          </div>

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
              className="mt-1 block w-full border rounded-md shadow-sm"
            ></textarea>
          </div>

          <div>
            <label htmlFor="deliveryArea" className="block text-sm font-medium">
              Delivery Area<span className="text-red-500">*</span>
            </label>
            <select
              id="deliveryArea"
              name="deliveryArea"
              value={formData.deliveryArea}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-md shadow-sm"
            >
              <option value="">Select Delivery Area</option>
              {deliveryAreas.map((area) => (
                <option key={area.area} value={area.area}>
                  {area.area} - ${area.price}
                </option>
              ))}
            </select>
          </div>

          {/* Promo Code */}
          <div>
            <label htmlFor="promoCode" className="block text-sm font-medium">
              Promo Code
            </label>
            <input
              type="text"
              id="promoCode"
              name="promoCode"
              value={formData.promoCode || ""}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md shadow-sm"
            />
            <button
              type="button"
              onClick={handlePromoCodeValidation}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Apply Promo Code
            </button>
          </div>
          {/* Cart Items Display */}
          <div className="bg-gray-200 p-4 rounded-md shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
                  <div className="flex items-center">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover mr-4"
                    />
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.size} | {item.color}</p>
                      <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">${item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Delivery Charge */}
          <div className="flex justify-between items-center mt-4">
            <p className="font-semibold text-lg">Delivery Charge</p>
            <p className="font-semibold text-lg">
              ${formData.deliveryArea ? deliveryAreas.find(area => area.area === formData.deliveryArea)?.price : 0}
            </p>
          </div>

          {/* Discount Display */}
          {discount > 0 && (
            <div className="flex justify-between items-center mt-4">
              <p className="font-semibold text-lg text-green-500">Discount</p>
              <p className="font-semibold text-lg text-green-500">{discount}%</p>
            </div>
          )}

          {/* Total Amount */}
          <div className="flex justify-between items-center mt-4">
            <p className="font-semibold text-lg">Total Amount</p>
            <p className="font-semibold text-lg">${calculateTotalAmount()}</p>
          </div>

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
