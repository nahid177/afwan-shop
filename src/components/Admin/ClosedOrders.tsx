// src/components/Admin/ClosedOrders.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IOrderClient } from "@/interfaces/IOrderClient";
import Toast from "@/components/Toast/Toast";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
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
        onClick={(e) => e.stopPropagation()}
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
          width={800}
          height={800}
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

const ClosedOrders: React.FC = () => {
  const [orders, setOrders] = useState<IOrderClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to manage visibility of sensitive information
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<boolean>(false);

  // State for Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] =
    useState<"success" | "error" | "warning">("success");

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
    const fetchClosedOrders = async () => {
      try {
        const response = await axios.get<IOrderClient[]>(
          "/api/admin/orders/closed"
        );
        setOrders(response.data);
      } catch (error: unknown) {
        console.error("Error fetching closed orders:", error);
        setError("Failed to load closed orders.");

        const message = getErrorMessage(error, "Failed to load closed orders.");
        setToastMessage(message);
        setToastType("error");
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedOrders();
  }, []);

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
      <div className="flex justify-center items-center h-16">
        <p>Loading closed orders...</p>
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
        <h1 className="text-2xl font-bold">Closed Orders</h1>
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
        <p>No closed orders found.</p>
      ) : (
        <div className="overflow-x-auto">
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
                  <tr key={order._id}>
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
                        {/* Add other actions if necessary */}
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
    </div>
  );
};

export default ClosedOrders;
