// /src/app/admin/orders/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import axios, { AxiosError, AxiosResponse } from "axios";
import { IOrder } from "@/models/Order";
import Link from "next/link";
import Toast from "@/components/Toast/Toast";
import { FaTrash, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa"; // Import FaTimes for close icon
import ConfirmationModal from "@/components/Admin/ConfirmationModal"; // Import the confirmation modal
import Image from "next/image";

// Define the error response interface
interface ApiErrorResponse {
  message: string;
}

// ImageModal Component
interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="image-modal-title"
    >
      <div
        className="relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl focus:outline-none"
          aria-label="Close Image Modal"
        >
          <FaTimes />
        </button>
        <Image
          src={imageUrl}
          alt="Full Size Product Image"
          width={800} // Adjust as needed
          height={800} // Adjust as needed
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] =
    useState<"success" | "error" | "warning">("success");

  // Confirmation Modal state for Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string>("");

  // State to manage visibility of sensitive information
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<boolean>(false);

  // State for Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Helper function to extract error message
  const getErrorMessage = (
    error: unknown,
    defaultMessage: string
  ): string => {
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response: AxiosResponse<IOrder[]> = await axios.get<IOrder[]>(
          "/api/admin/orders"
        );
        setOrders(response.data);
      } catch (error: unknown) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders.");

        const message = getErrorMessage(error, "Failed to load orders.");
        setToastMessage(message);
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
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
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
    if (orderToDelete) {
      deleteOrder(orderToDelete);
      setOrderToDelete("");
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setOrderToDelete("");
    setIsDeleteModalOpen(false);
  };

  const openDeleteModal = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  };

  // Removed states and functions related to approval confirmation modal

  // Function to toggle visibility of Buying Price and Profit
  const toggleSensitiveInfo = () => {
    setShowSensitiveInfo((prev) => !prev);
  };

  // Function to open Image Modal
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Function to close Image Modal
  const closeImageModal = () => {
    setSelectedImage("");
    setIsImageModalOpen(false);
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

  if (error) {
    const errorMessage =
      typeof error === "string" ? error : "An unexpected error occurred.";
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-16">
          <p>{errorMessage}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Orders Management</h1>
          {/* Toggle Button for Sensitive Information */}
          <button
            onClick={toggleSensitiveInfo}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none"
            aria-label={showSensitiveInfo ? "Hide Sensitive Info" : "Show Sensitive Info"}
            title={showSensitiveInfo ? "Hide Buying Price and Profit" : "Show Buying Price and Profit"}
          >
            {showSensitiveInfo ? (
              <>
                <FaEyeSlash className="mr-2" />
                Hide Info
              </>
            ) : (
              <>
                <FaEye className="mr-2" />
                Show Info
              </>
            )}
          </button>
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

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  {[
                    "Customer Name",
                    "Contact Number",
                    "Total Amount",
                    "Date",
                    "Approved",
                    "Codes",
                    "Image",
                    "Buying Price",
                    "Profit", // New Profit Column
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} className="py-2 px-4 border-b text-left">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  // Aggregate codes from all items
                  const allCodes = order.items
                    .map((item) => item.code.join(", "))
                    .join("; ");

                  // Aggregate buying prices from all items
                  const totalBuyingPrice = order.items.reduce(
                    (sum, item) =>
                      sum + (item.buyingPrice || 0) * (item.quantity || 0),
                    0
                  );

                  // Calculate profit
                  const profit = (order.totalAmount || 0) - totalBuyingPrice;

                  // Collect images from items (taking the first image for simplicity)
                  const images = order.items
                    .map((item) => item.image)
                    .filter((img) => img !== "");
                  const thumbnail =
                    images.length > 0 ? images[0] : "/placeholder.png"; // Use a placeholder if no image

                  return (
                    <tr
                      key={order._id}
                      className={!order.approved ? "bg-yellow-100" : "bg-white"}
                    >
                      <td className="py-2 px-4 border-b">{order.customerName}</td>
                      <td className="py-2 px-4 border-b">{order.customerNumber}</td>
                      <td className="py-2 px-4 border-b">
                        Tk. {order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {order.approved ? (
                          <span className="text-green-600 font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">{allCodes}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => openImageModal(thumbnail)}
                          className="focus:outline-none"
                          aria-label="View Full Image"
                        >
                          <Image
                            src={thumbnail}
                            alt="Product Image"
                            width={64}
                            height={64}
                            className="object-cover rounded hover:opacity-75 transition-opacity duration-200"
                          />
                        </button>
                      </td>
                      {/* Buying Price Column */}
                      <td className="py-2 px-4 border-b">
                        {showSensitiveInfo ? (
                          `Tk. ${totalBuyingPrice.toFixed(2)}`
                        ) : (
                          <span className="text-gray-500">•••••</span>
                        )}
                      </td>
                      {/* Profit Column */}
                      <td
                        className={`py-2 px-4 border-b ${
                          profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {showSensitiveInfo ? (
                          `Tk. ${profit.toFixed(2)}`
                        ) : (
                          <span className="text-gray-500">•••••</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex justify-center space-x-2">
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
                          <button
                            onClick={() => openDeleteModal(order._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Order"
                            aria-label="Delete Order"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this order? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Removed Confirmation Modal for Approval */}
    </AdminLayout>
  );
};

export default AdminOrdersPage;
