// src/components/Admin/OpenStoreOrders.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IStoreOrder } from "@/types";
import Link from "next/link";
import Toast from "@/components/Toast/Toast";
import ConfirmationModal from "@/components/Admin/ConfirmationModal";
import Image from "next/image";
import {
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const OpenStoreOrders: React.FC = () => {
  const [storeOrders, setStoreOrders] = useState<IStoreOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] =
    useState<"success" | "error" | "warning">("success");

  // Confirmation Modal state for Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string>("");

  // Confirmation Modal state for Confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] =
    useState<boolean>(false);
  const [orderToConfirm, setOrderToConfirm] = useState<string>("");

  // Confirmation Modal state for Closing
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false);
  const [orderToClose, setOrderToClose] = useState<string>("");

  // Confirmation Modal state for Closing All Orders
  const [isCloseAllModalOpen, setIsCloseAllModalOpen] =
    useState<boolean>(false);

  // Number of confirmations left for closing all orders
  const [closeAllConfirmationsLeft, setCloseAllConfirmationsLeft] =
    useState<number>(0);

  // State to manage visibility of sensitive information
  const [showSensitiveInfo, setShowSensitiveInfo] =
    useState<boolean>(false);

  // State to manage expanded rows
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(
    new Set()
  );

  // State to manage image modal
  const [isImageModalOpen, setIsImageModalOpen] =
    useState<boolean>(false);
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
    const fetchStoreOrders = async () => {
      try {
        const response = await axios.get<IStoreOrder[]>("/api/storeOrders");
        setStoreOrders(response.data);
      } catch (error: unknown) {
        console.error("Error fetching store orders:", error);
        setError("Failed to load store orders.");

        const message = getErrorMessage(error, "Failed to load store orders.");
        setToastMessage(message);
        setToastType("error");
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreOrders();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/storeOrders/${orderToDelete}`);
      setStoreOrders(
        storeOrders.filter((order) => order._id !== orderToDelete)
      );
      setToastMessage("Order deleted successfully.");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      console.error("Error deleting store order:", error);

      const message = getErrorMessage(error, "Failed to delete store order.");
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.patch<IStoreOrder>(
        `/api/storeOrders/${orderToConfirm}/confirm`
      );
      // Update the specific order in the state
      setStoreOrders(
        storeOrders.map((order) =>
          order._id === response.data._id ? response.data : order
        )
      );
      setToastMessage("Order confirmed successfully.");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      console.error("Error confirming store order:", error);

      const message = getErrorMessage(error, "Failed to confirm store order.");
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const handleClose = async () => {
    try {
      const response = await axios.patch<IStoreOrder>(
        `/api/storeOrders/${orderToClose}`,
        {
          status: "closed",
        }
      );
      // Update the specific order in the state
      setStoreOrders(
        storeOrders.map((order) =>
          order._id === response.data._id ? response.data : order
        )
      );
      setToastMessage("Order closed successfully.");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      console.error("Error closing store order:", error);

      const message = getErrorMessage(error, "Failed to close store order.");
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsCloseModalOpen(false);
    }
  };

  // Function to close all approved open orders with triple confirmation
  const handleCloseAllConfirm = async () => {
    if (closeAllConfirmationsLeft > 1) {
      // Decrement the confirmations left
      setCloseAllConfirmationsLeft(closeAllConfirmationsLeft - 1);
      // Keep the modal open
      setIsCloseAllModalOpen(true);
    } else {
      // Proceed to close all orders
      await handleCloseAll();
      // Reset confirmations left
      setCloseAllConfirmationsLeft(0);
    }
  };

  // Function to close all approved open orders
  const handleCloseAll = async () => {
    try {
      // Filter out orders that are both open and approved
      const openApprovedOrders = storeOrders.filter(
        (order) => order.status === "open" && order.approved
      );

      if (openApprovedOrders.length === 0) {
        setToastMessage("No approved open orders to close.");
        setToastType("warning");
        setToastVisible(true);
        return;
      }

      // Use Promise.all to close all approved open orders concurrently
      await Promise.all(
        openApprovedOrders.map((order) =>
          axios.patch<IStoreOrder>(`/api/storeOrders/${order._id}`, {
            status: "closed",
          })
        )
      );

      // Update the orders in the state
      setStoreOrders(
        storeOrders.map((order) =>
          openApprovedOrders.find((o) => o._id === order._id)
            ? { ...order, status: "closed" }
            : order
        )
      );

      setToastMessage("All approved open orders closed successfully.");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      console.error("Error closing all approved open store orders:", error);

      const message = getErrorMessage(
        error,
        "Failed to close all approved open store orders."
      );
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsCloseAllModalOpen(false);
    }
  };

  const openDeleteModal = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  };

  const openConfirmModal = (orderId: string) => {
    setOrderToConfirm(orderId);
    setIsConfirmModalOpen(true);
  };

  const openCloseModal = (orderId: string) => {
    setOrderToClose(orderId);
    setIsCloseModalOpen(true);
  };

  const openCloseAllModal = () => {
    setCloseAllConfirmationsLeft(3); // Set to 3 confirmations required
    setIsCloseAllModalOpen(true);
  };

  const toggleExpandOrder = (orderId: string) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (expandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  // Function to open image modal
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Function to close image modal
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage("");
  };

  // Check if there are any approved open orders
  const openOrdersExist = storeOrders.some(
    (order) => order.status === "open" && order.approved
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <p>Loading store orders...</p>
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
      {/* Header and Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Open Store Orders</h1>
        <div>
          <button
            onClick={openCloseAllModal}
            className={`px-4 py-2 text-white rounded-lg ${
              openOrdersExist
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!openOrdersExist}
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

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeImageModal}
        >
          <div className="relative">
            <Image
              src={selectedImage}
              alt="Full Size Image"
              width={800}
              height={800}
              className="max-w-full max-h-full"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-white text-2xl font-bold"
              aria-label="Close image"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {storeOrders.length === 0 ? (
        <p>No store orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                {/* Headers */}
                <th className="py-2 px-4 border-b">Code</th>
                <th className="py-2 px-4 border-b">Customer Name</th>
                <th className="py-2 px-4 border-b">Phone</th>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b">Total Amount</th>
                <th className="py-2 px-4 border-b">
                  <div className="flex items-center justify-center">
                    Buying Price
                    <button
                      onClick={() =>
                        setShowSensitiveInfo(!showSensitiveInfo)
                      }
                      className="ml-2 text-gray-600 hover:text-gray-800"
                      aria-label={
                        showSensitiveInfo
                          ? "Hide sensitive information"
                          : "Show sensitive information"
                      }
                    >
                      {showSensitiveInfo ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </th>
                <th className="py-2 px-4 border-b">Profit</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
                <th className="py-2 px-4 border-b">Products</th>
              </tr>
            </thead>
            <tbody>
              {storeOrders.map((order) => {
                // Calculations and state
                const totalBuyingPrice = order.products
                  ? order.products.reduce(
                      (sum, product) =>
                        sum +
                        (product.buyingPrice || 0) *
                          (product.quantity || 0),
                      0
                    )
                  : 0;

                const profit =
                  (order.totalAmount || 0) - totalBuyingPrice;

                const isExpanded = expandedOrders.has(order._id);

                const rowClasses = `text-center ${
                  order.status === "closed"
                    ? "bg-gray-300 text-gray-600"
                    : order.approved
                    ? "bg-white text-black"
                    : "bg-yellow-100 text-gray-800"
                } hover:bg-gray-200 transition-colors duration-200`;

                return (
                  <React.Fragment key={order._id}>
                    <tr className={rowClasses}>
                      <td className="py-2 px-4 border-b">{order.code}</td>
                      <td className="py-2 px-4 border-b">
                        {order.customerName}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {order.customerPhone}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {order.products &&
                        order.products.length > 0 &&
                        order.products[0].productImage ? (
                          <button
                            onClick={() =>
                              openImageModal(
                                order.products[0].productImage
                              )
                            }
                            className="focus:outline-none"
                            aria-label="View full image"
                          >
                            <Image
                              src={order.products[0].productImage}
                              alt="Product Image"
                              width={50}
                              height={50}
                              className="mx-auto"
                            />
                          </button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        Tk.{" "}
                        {order.totalAmount
                          ? order.totalAmount.toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {showSensitiveInfo ? (
                          `Tk. ${totalBuyingPrice.toFixed(2)}`
                        ) : (
                          <span className="text-gray-500">•••••</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {showSensitiveInfo ? (
                          `Tk. ${profit.toFixed(2)}`
                        ) : (
                          <span className="text-gray-500">•••••</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {order.status === "closed" ? (
                          <span className="text-red-600 font-semibold">
                            Closed
                          </span>
                        ) : order.approved ? (
                          <span className="text-green-600 font-semibold">
                            Approved
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Link href={`/admin/storeOrders/${order._id}`}>
                          <button className="mr-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                            View
                          </button>
                        </Link>
                        {!order.approved &&
                          order.status !== "closed" && (
                            <button
                              onClick={() => openConfirmModal(order._id)}
                              className="mr-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              aria-label={`Confirm order ${order.code}`}
                            >
                              Confirm
                            </button>
                          )}
                        <button
                          onClick={() => openDeleteModal(order._id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          aria-label={`Delete order ${order.code}`}
                        >
                          Delete
                        </button>
                      </td>
                      <td className="py-2 px-4 border-b">
                        {order.products && order.products.length > 0 ? (
                          <button
                            onClick={() => toggleExpandOrder(order._id)}
                            className="flex items-center justify-center px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            aria-label={
                              isExpanded
                                ? `Hide products for order ${order.code}`
                                : `View products for order ${order.code}`
                            }
                          >
                            {isExpanded ? (
                              <>
                                Hide Products{" "}
                                <FaChevronUp className="ml-1" />
                              </>
                            ) : (
                              <>
                                View Products{" "}
                                <FaChevronDown className="ml-1" />
                              </>
                            )}
                          </button>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="bg-gray-100">
                          <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">
                              Products
                            </h2>
                            <table className="min-w-full bg-white dark:bg-gray-700">
                              <thead>
                                <tr>
                                  <th className="py-2 px-4 border-b">
                                    Product Name
                                  </th>
                                  <th className="py-2 px-4 border-b">
                                    Product Code
                                  </th>
                                  <th className="py-2 px-4 border-b">
                                    Image
                                  </th>
                                  <th className="py-2 px-4 border-b">
                                    Quantity
                                  </th>
                                  <th className="py-2 px-4 border-b">
                                    Color
                                  </th>
                                  <th className="py-2 px-4 border-b">
                                    Size
                                  </th>
                                  <th className="py-2 px-4 border-b">
                                    Buying Price
                                  </th>
                                  <th className="py-2 px-4 border-b">
                                    Offer Price
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.products.map((product) => (
                                  <tr
                                    key={product._id}
                                    className="text-center hover:bg-gray-200 transition-colors duration-200"
                                  >
                                    <td className="py-2 px-4 border-b">
                                      {product.productName}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      {product.productCode}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      {product.productImage ? (
                                        <button
                                          onClick={() =>
                                            openImageModal(
                                              product.productImage
                                            )
                                          }
                                          className="focus:outline-none"
                                          aria-label="View full image"
                                        >
                                          <Image
                                            src={product.productImage}
                                            alt={product.productName}
                                            width={50}
                                            height={50}
                                            className="mx-auto"
                                          />
                                        </button>
                                      ) : (
                                        "N/A"
                                      )}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      {product.quantity}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      {product.color || "N/A"}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      {product.size || "N/A"}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      Tk. {product.buyingPrice.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                      Tk. {product.offerPrice.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this store order? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Confirmation Modal for Confirmation */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Confirm Order"
        message="Are you sure you want to confirm this order?"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      {/* Confirmation Modal for Closing */}
      <ConfirmationModal
        isOpen={isCloseModalOpen}
        title="Close Order"
        message="Are you sure you want to close this order?"
        onConfirm={handleClose}
        onCancel={() => setIsCloseModalOpen(false)}
      />

      {/* Confirmation Modal for Closing All Orders */}
      <ConfirmationModal
        isOpen={isCloseAllModalOpen}
        title="Close All Orders"
        message={`Are you sure you want to close all approved open orders? This action cannot be undone.${
          closeAllConfirmationsLeft > 1
            ? `\n\nYou need to confirm ${closeAllConfirmationsLeft} more time(s).`
            : ""
        }`}
        onConfirm={handleCloseAllConfirm}
        onCancel={() => {
          setIsCloseAllModalOpen(false);
          setCloseAllConfirmationsLeft(0);
        }}
      />
    </div>
  );
};

export default OpenStoreOrders;
