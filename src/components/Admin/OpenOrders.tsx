// src/components/Admin/OpenOrders.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IOrderClient } from "@/interfaces/IOrderClient";
import Toast from "@/components/Toast/Toast";
import { FaTrash, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import ConfirmationModal from "@/components/Admin/ConfirmationModal";
import Image from "next/image";
import Link from "next/link";

// ImageModal Component
interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
}) => {
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

const OpenOrders: React.FC = () => {
  const [orders, setOrders] = useState<IOrderClient[]>([]);
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

  // Confirmation Modal state for Closing All Orders with multiple confirmations
  const [isCloseAllModalOpen, setIsCloseAllModalOpen] = useState<number>(0);

  // State to manage visibility of sensitive information
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<boolean>(false);

  // State for Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get<IOrderClient[]>("/api/admin/orders");
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
      const response = await axios.patch<IOrderClient>(
        `/api/admin/orders/${orderId}/confirm`
      );
      const updatedOrder: IOrderClient = response.data;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );

      setToastMessage("Order approved successfully!");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to confirm the order.");
      setToastMessage(message);
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
      const message = getErrorMessage(error, "Failed to delete the order.");
      setToastMessage(message);
      console.error("Error deleting order:", error);
      setToastType("error");
      setToastVisible(true);
    }
  };

  // Function to handle confirmation of deletion
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

  // Function to close all open orders
  const closeAllOrders = async () => {
    try {
      // Get the IDs of all open orders
      const openOrderIds = orders
        .filter((order) => order.status === "open")
        .map((order) => order._id);

      // Use Promise.all to close all orders concurrently
      await Promise.all(
        openOrderIds.map((orderId) =>
          axios.patch(`/api/admin/orders/${orderId}/close`)
        )
      );

      // Update the orders in the state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.status === "open" ? { ...order, status: "close" } : order
        )
      );

      setToastMessage("All open orders closed successfully!");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to close all orders.");
      setToastMessage(message);
      console.error("Error closing all orders:", error);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsCloseAllModalOpen(0);
    }
  };

  // Handlers for Closing All Orders with multiple confirmations
  const handleCloseAllConfirm = () => {
    if (isCloseAllModalOpen < 2) {
      setIsCloseAllModalOpen((prev) => prev + 1);
    } else {
      closeAllOrders();
    }
  };

  const handleCloseAllCancel = () => {
    setIsCloseAllModalOpen(0);
  };

  // Check if there are any open orders
  const openOrdersExist = orders.some((order) => order.status === "open");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <p>Loading open orders...</p>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      typeof error === "string" ? error : "An unexpected error occurred.";
    return (
      <div className="flex justify-center items-center h-16">
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Open Orders</h1>
        <div className="flex items-center space-x-2">
          {/* Toggle Button for Sensitive Information */}
          <button
            onClick={toggleSensitiveInfo}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none"
            aria-label={
              showSensitiveInfo ? "Hide Sensitive Info" : "Show Sensitive Info"
            }
            title={
              showSensitiveInfo
                ? "Hide Buying Price and Profit"
                : "Show Buying Price and Profit"
            }
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
          {/* Close All Orders Button */}
          <button
            onClick={() => setIsCloseAllModalOpen(1)}
            className={`px-4 py-2 text-white rounded-lg ${
              openOrdersExist
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!openOrdersExist}
            aria-label="Close All Orders"
            title="Close All Orders"
          >
            Close All Orders
          </button>
        </div>
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
        <p>No open orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Render your table here, filtering orders with status 'open' */}
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                {/* Table headers */}
                <th className="py-2 px-4 border-b">Customer Name</th>
                <th className="py-2 px-4 border-b">Contact Number</th>
                <th className="py-2 px-4 border-b">Total Amount</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Approved</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Codes</th>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b">Buying Price</th>
                <th className="py-2 px-4 border-b">Profit</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((order) => order.status === "open")
                .map((order) => {
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
                      <td className="py-2 px-4 border-b">
                        {order.customerNumber}
                      </td>
                      <td className="py-2 px-4 border-b">
                        Tk. {order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {order.approved ? (
                          <span className="text-green-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">No</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span
                          className={`px-2 py-1 rounded ${
                            order.status === "open"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
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
                      <td className="py-2 px-4 border-b">
                        {showSensitiveInfo ? (
                          `Tk. ${totalBuyingPrice.toFixed(2)}`
                        ) : (
                          <span className="text-gray-500">•••••</span>
                        )}
                      </td>
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

      {/* Confirmation Modals for Closing All Orders */}
      {isCloseAllModalOpen > 0 && (
        <ConfirmationModal
          isOpen={true}
          title="Confirm Closing All Orders"
          message={
            isCloseAllModalOpen === 1
              ? "Are you sure you want to close all open orders? This action cannot be undone."
              : isCloseAllModalOpen === 2
              ? "This will permanently close all open orders. Are you absolutely sure?"
              : "Final confirmation: Do you really want to proceed with closing all open orders?"
          }
          onConfirm={handleCloseAllConfirm}
          onCancel={handleCloseAllCancel}
        />
      )}
    </div>
  );
};

export default OpenOrders;
