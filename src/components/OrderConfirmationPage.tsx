"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { IOrder, IOrderItem } from "@/models/Order";
import Toast from "@/components/Toast/Toast";
import Link from "next/link";
import { useTheme } from "@/mode/ThemeContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Correctly imported

const OrderConfirmationPage: React.FC = () => {
  const { theme } = useTheme(); // Get the current theme
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "error"
  );

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Specify the type of the response data
        const response = await axios.get<IOrder>(`/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
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

  // Function to handle PDF download
  const handleDownload = () => {
    if (!order) return;

    const doc = new jsPDF();

    // Add content to PDF
    doc.setFontSize(18);
    doc.text("Order Confirmation", 14, 22);

    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, 32);
    doc.text(`Customer Name: ${order.customerName}`, 14, 40);
    doc.text(`Contact Number: ${order.customerNumber}`, 14, 48);
    if (order.otherNumber) {
      doc.text(`Other Number: ${order.otherNumber}`, 14, 56);
    }
    const addressY = order.otherNumber ? 64 : 56;
    doc.text(`Address:`, 14, addressY);
    doc.text(`${order.address1}`, 20, addressY + 8);
    if (order.address2) {
      doc.text(`${order.address2}`, 20, addressY + 16);
    }

    // Calculate startY for the table
    let startY = addressY + 24;
    if (order.address2) {
      startY += 8;
    }

    // Add order items using autoTable
    const itemRows = order.items.map((item, index) => [
      index + 1,
      item.name,
      item.color,
      item.size,
      item.quantity.toString(),
      item.price.toString(),
      (item.quantity * item.price).toString(),
    ]);

    autoTable(doc, {
      startY: startY,
      head: [["#", "Name", "Color", "Size", "Qty", "Price", "Total"]],
      body: itemRows,
    });

    // Add total amount
    const finalY = doc.lastAutoTable?.finalY || startY + 10;
    doc.text(`Total Amount: Tk. ${order.totalAmount}`, 14, finalY + 10);

    // Save the PDF
    doc.save(`Order_${order._id}.pdf`);
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        <p>Order not found.</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
      }`}
    >
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

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Thank You for Your Order!
        </h1>

        <div className="mb-4">
          <strong>Order ID:</strong> {order._id}
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
                {item.name} - Color: {item.color}, Size: {item.size} x{" "}
                {item.quantity} @ Tk. {item.price} each
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <strong>Total Amount:</strong> Tk. {order.totalAmount}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <button
            className="px-4 py-2 rounded-md btn-gradient-blue"
            onClick={handleDownload}
          >
            Download Order Details
          </button>
          <Link href="/">
            <button className="px-4 py-2 rounded-md btn-gradient-blue">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
