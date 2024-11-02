// src/app/admin/orders/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import axios, { AxiosError, AxiosResponse } from "axios";
import { IOrder } from "@/models/Order";
import Link from "next/link";
import Toast from "@/components/Toast/Toast";
import { FaTrash } from "react-icons/fa"; // Import the trash icon
import ConfirmationModal from "@/components/Admin/ConfirmationModal"; // Import the confirmation modal

// Define the error response interface
interface ApiErrorResponse {
  message: string;
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "success"
  );

  // States for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response: AxiosResponse<IOrder[]> = await axios.get<IOrder[]>("/api/admin/orders");
        setOrders(response.data);
      } catch (error: unknown) {
        console.error("Error fetching orders:", error);
        setToastMessage("Failed to fetch orders.");
        setToastType("error");
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const confirmOrder = async (orderId: string) => {
    try {
      const response: AxiosResponse<IOrder> = await axios.patch<IOrder>(
        `/api/admin/orders/${orderId}/confirm`
      );
      const updatedOrder: IOrder = response.data;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );

      setToastMessage("Order approved successfully!");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        setToastMessage(
          axiosError.response?.data?.message || "Failed to confirm the order."
        );
      } else if (error instanceof Error) {
        setToastMessage(error.message || "An unexpected error occurred.");
      } else {
        setToastMessage("An unexpected error occurred.");
      }
      console.error("Error confirming order:", error);
      setToastType("error");
      setToastVisible(true);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await axios.delete(`/api/admin/orders/${orderId}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      setToastMessage("Order deleted successfully!");
      setToastType("success");
      setToastVisible(true);
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
    if (selectedOrderId) {
      deleteOrder(selectedOrderId);
      setSelectedOrderId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setSelectedOrderId(null);
    setIsDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-16">
          <p>Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Orders Management</h1>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {[
                "Order ID",
                "Customer Name",
                "Contact Number",
                "Total Amount",
                "Date",
                "Approved",
                "Actions",
              ].map((heading) => (
                <th key={heading} className="py-2 px-4 border-b">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className={order.approved ? "bg-green-100" : "bg-white"}
              >
                <td className="py-2 px-4 border-b">{order._id}</td>
                <td className="py-2 px-4 border-b">{order.customerName}</td>
                <td className="py-2 px-4 border-b">{order.customerNumber}</td>
                <td className="py-2 px-4 border-b">Tk. {order.totalAmount}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {order.approved ? "Yes" : "No"}
                </td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <Link href={`/admin/orders/${order._id}`}>
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                      View Details
                    </button>
                  </Link>
                  {!order.approved && (
                    <button
                      onClick={() => confirmOrder(order._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Approve
                    </button>
                  )}
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      setSelectedOrderId(order._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Order"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </AdminLayout>
  );
};

export default AdminOrdersPage;
