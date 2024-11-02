// src/app/admin/orders/[orderId]/page.tsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "../../AdminLayout";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import axios, { AxiosError } from "axios";
import { IOrder } from "@/models/Order";
import { useReactToPrint } from "react-to-print";
import PrintableOrder from "./PrintableOrder";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaTrash, FaEdit } from "react-icons/fa"; // Import the trash and edit icons
import Toast from "@/components/Toast/Toast";
import ConfirmationModal from "@/components/Admin/ConfirmationModal"; // Import the confirmation modal
import EditOrderModal from "@/components/Admin/EditOrderModal"; // Import the edit order modal

// Define the error response interface
interface ApiErrorResponse {
  message: string;
}

const OrderDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter(); // Initialize useRouter
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "success"
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // State for edit modal

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get<IOrder>(`/api/admin/orders/${orderId}`);
        setOrder(response.data);
      } catch (error: unknown) {
        console.error("Error fetching order:", error);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handlePrintClick = () => {
    if (componentRef.current) {
      handlePrint();
    } else {
      console.error("Print content not available");
    }
  };

  const handleDownload = () => {
    if (!order) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Order Confirmation", 14, 22);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, 32);
    doc.text(`Customer Name: ${order.customerName}`, 14, 40);
    doc.text(`Contact Number: ${order.customerNumber}`, 14, 48);
    if (order.otherNumber) doc.text(`Other Number: ${order.otherNumber}`, 14, 56);

    const addressY = order.otherNumber ? 64 : 56;
    doc.text(`Address:`, 14, addressY);
    doc.text(`${order.address1}`, 20, addressY + 8);
    if (order.address2) doc.text(`${order.address2}`, 20, addressY + 16);

    let startY = addressY + 24;
    if (order.address2) startY += 8;

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

    const finalY = doc.lastAutoTable?.finalY || startY + 10;
    doc.text(`Total Amount: Tk. ${order.totalAmount}`, 14, finalY + 10);
    doc.save(`Order_${order._id}.pdf`);
  };

  const deleteOrder = async () => {
    if (!order) return;

    try {
      await axios.delete(`/api/admin/orders/${order._id}`);
      setToastMessage("Order deleted successfully!");
      setToastType("success");
      setToastVisible(true);
      // Redirect to the orders list page after deletion
      router.push("/admin/orders");
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        setToastMessage(
          axiosError.response?.data?.message || "Failed to delete the order."
        );
      } else if (error instanceof Error) {
        setToastMessage(error.message || "An unexpected error occurred.");
      } else {
        setToastMessage("An unexpected error occurred.");
      }
      console.error("Error deleting order:", error);
      setToastType("error");
      setToastVisible(true);
    }
  };

  const handleDeleteConfirm = () => {
    deleteOrder();
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleEditOrder = async (updatedData: Partial<IOrder>) => {
    if (!order) return;

    try {
      const response = await axios.patch<IOrder>(`/api/admin/orders/${order._id}/edit`, updatedData);
      setOrder(response.data);
      setToastMessage("Order updated successfully!");
      setToastType("success");
      setToastVisible(true);
      setIsEditModalOpen(false);
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        setToastMessage(
          axiosError.response?.data?.message || "Failed to update the order."
        );
      } else if (error instanceof Error) {
        setToastMessage(error.message || "An unexpected error occurred.");
      } else {
        setToastMessage("An unexpected error occurred.");
      }
      console.error("Error updating order:", error);
      setToastType("error");
      setToastVisible(true);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-16">
          <p>Loading order details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-16">
          <p>Order not found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 ">
        <h1 className="text-2xl font-bold mb-4">Order Details</h1>
        {error && (
          <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">
            {error}
          </div>
        )}
        <div className="mb-4"><strong>Order ID:</strong> {order._id}</div>
        <div className="mb-4"><strong>Customer Name:</strong> {order.customerName}</div>
        <div className="mb-4">
          <strong>Contact Number:</strong> {order.customerNumber}
          {order.otherNumber && <span>, {order.otherNumber}</span>}
        </div>
        <div className="mb-4"><strong>Address Line 1:</strong> <p>{order.address1}</p></div>
        {order.address2 && (
          <div className="mb-4"><strong>Address Line 2:</strong> <p>{order.address2}</p></div>
        )}
        <div className="mb-4">
          <strong>Order Items:</strong>
          <ul className="list-disc list-inside">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} - Color: {item.color}, Size: {item.size} x {item.quantity} @ Tk. {item.price} each
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4"><strong>Total Amount:</strong> Tk. {order.totalAmount}</div>
        <div className="mb-4"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>

        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mt-4"
            onClick={handlePrintClick}
          >
            Print Order
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
            onClick={handleDownload}
          >
            Download PDF
          </button>
          {/* Edit Button */}
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 mt-4 flex items-center"
            title="Edit Order"
          >
            <FaEdit className="mr-2" /> Edit Order
          </button>
          {/* Delete Button */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mt-4 flex items-center"
            title="Delete Order"
          >
            <FaTrash className="mr-2" /> Delete Order
          </button>
        </div>
      </div>
      {/* Printable Component */}
      <div style={{ display: "none" }}>
        {order && <PrintableOrder ref={componentRef} order={order} />}
      </div>

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

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={order}
        onSave={handleEditOrder}
      />
    </AdminLayout>
  );
};

export default OrderDetailsPage;
