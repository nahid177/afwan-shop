// src/app/admin/storeOrders/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios"; // Removed AxiosError as it's not used
import { IStoreOrder } from "@/types"; // Corrected import from "@/types"
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast/Toast";
// Removed EditStatusModal import as 'status' is removed
import ConfirmationModal from "@/components/Admin/ConfirmationModal";
import AdminLayout from "../../AdminLayout";

// Helper function to extract error message
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error)) {
    if (
      error.response &&
      error.response.data &&
      typeof error.response.data.message === "string"
    ) {
      return error.response.data.message;
    }
  }
  return defaultMessage;
};

const AdminStoreOrderDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [storeOrder, setStoreOrder] = useState<IStoreOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchStoreOrder = async () => {
      setLoading(true);
      try {
        const response = await axios.get<IStoreOrder>(`/api/storeOrders/${orderId}`);
        setStoreOrder(response.data);
      } catch (error: unknown) {
        console.error("Error fetching store order:", error);
        const message = getErrorMessage(error, "Failed to load order details.");
        setToast({ visible: true, message: message, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreOrder();
  }, [orderId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/storeOrders/${orderId}`);
      setToast({ visible: true, message: "Order deleted successfully.", type: "success" });
      router.push("/admin/storeOrders");
    } catch (error: unknown) {
      console.error("Error deleting store order:", error);
      const message = getErrorMessage(error, "Failed to delete order.");
      setToast({ visible: true, message: message, type: "error" });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <p>Loading store order details...</p>;

  return (
    <AdminLayout>
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ ...toast, visible: false })}
          />
        </div>
      )}
      <h1 className="text-2xl font-bold">Store Order Details</h1>
      {storeOrder && (
        <div className="mt-4">
          <p>
            <strong>Order ID:</strong> {storeOrder._id}
          </p>
          <p>
            <strong>Customer Name:</strong> {storeOrder.customerName}
          </p>
          <p>
            <strong>Email:</strong> {storeOrder.customerEmail}
          </p>
          <p>
            <strong>Phone:</strong> {storeOrder.customerPhone}
          </p>
          <p>
            <strong>Total Amount:</strong> Tk. {storeOrder.totalAmount.toFixed(2)}
          </p>
          {/* Removed Status as per request */}
          {/* Add more order details as needed */}
        </div>
      )}
      {/* Action Buttons */}
      <div className="mt-6">
        {/* Removed "Edit Status" button */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete Order
        </button>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this store order? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </AdminLayout>
  );
};

export default AdminStoreOrderDetailsPage;
