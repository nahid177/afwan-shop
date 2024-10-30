// src/app/order-confirmation/[orderId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { IOrder, IOrderItem } from "@/models/Order"; // Correct imports
import Toast from "@/components/Toast/Toast";
import Link from "next/link";

const OrderConfirmationPage: React.FC = () => {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (error: unknown) {
        console.error("Error fetching order:", error);
        setToastMessage("Failed to retrieve order details.");
        setToastType("error");
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Order not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
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

      <h1 className="text-3xl font-bold mb-6">Thank You for Your Order!</h1>

      <div className="mb-4">
        <strong>Order ID:</strong> {order.id}
      </div>

      <div className="mb-4">
        <strong>Customer Name:</strong> {order.customerName}
      </div>

      <div className="mb-4">
        <strong>Contact Number:</strong> {order.customerNumber}
        {order.otherNumber && <span>, {order.otherNumber}</span>}
      </div>

      <div className="mb-4">
        <strong>Address:</strong>
        <p>{order.address1}</p>
        {order.address2 && <p>{order.address2}</p>}
      </div>

      <div className="mb-4">
        <strong>Order Items:</strong>
        <ul className="list-disc list-inside">
          {order.items.map((item: IOrderItem, index: number) => (
            <li key={index}>
              {item.name} - Color: {item.color}, Size: {item.size} x {item.quantity} @ Tk. {item.price} each
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <strong>Total Amount:</strong> Tk. {order.totalAmount}
      </div>

      <Link href="/">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Continue Shopping
        </button>
      </Link>
    </div>
  );
};

export default OrderConfirmationPage;
