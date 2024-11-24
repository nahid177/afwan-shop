// src/app/admin/storeOrders/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IStoreOrder, IProductType } from "@/types";
import Link from "next/link";
import Toast from "@/components/Toast/Toast";
import ConfirmationModal from "@/components/Admin/ConfirmationModal";
import CreateOrderModal from "@/components/Admin/CreateOrderModal";
import AdminLayout from "../AdminLayout";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import additional icons

const AdminStoreOrdersPage: React.FC = () => {
  const [storeOrders, setStoreOrders] = useState<IStoreOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] =
    useState<"success" | "error" | "warning">("success");

  // Confirmation Modal state for Deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string>("");

  // Confirmation Modal state for Confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [orderToConfirm, setOrderToConfirm] = useState<string>("");

  // Create Order Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedProductType, setSelectedProductType] =
    useState<IProductType | null>(null);

  // State to manage visibility of sensitive information
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<boolean>(false);

  // State to manage expanded rows
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

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
      setStoreOrders(storeOrders.filter((order) => order._id !== orderToDelete));
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
        `/api/storeOrders/${orderToConfirm}/confirm`,
        {
          // If your API doesn't require a body, you can omit this object
          // Or include any necessary data here
        }
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

  const handleCreateOrder = async (orderData: Omit<IStoreOrder, "_id">) => {
    try {
      const response = await axios.post<IStoreOrder>(
        "/api/storeOrders",
        orderData
      );
      setStoreOrders([...storeOrders, response.data]);
      setToastMessage("Order created successfully.");
      setToastType("success");
      setToastVisible(true);
    } catch (error: unknown) {
      console.error("Error creating store order:", error);

      const message = getErrorMessage(error, "Failed to create store order.");
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
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

  const openCreateModal = async () => {
    try {
      const response = await axios.get<IProductType[]>("/api/productTypes");
      if (response.data.length > 0) {
        setSelectedProductType(response.data[0]);
        setIsCreateModalOpen(true);
      } else {
        alert("No product types available.");
      }
    } catch (error: unknown) {
      console.error("Error fetching product types:", error);
      const message = getErrorMessage(error, "Failed to load product types.");
      setToastMessage(message);
      setToastType("error");
      setToastVisible(true);
    }
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-16">
          <p>Loading store orders...</p>
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
        {/* Header and Create Order Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Store Orders</h1>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Order
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

        {/* Orders Table */}
        {storeOrders.length === 0 ? (
          <p>No store orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead>
                <tr>
                  {/* Removed Order ID Header */}
                  <th className="py-2 px-4 border-b">Code</th>
                  <th className="py-2 px-4 border-b">Customer Name</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Image</th>
                  <th className="py-2 px-4 border-b">Total Amount</th>
                  {/* Buying Price Header with Eye Icon */}
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
                  {/* Profit Header */}
                  <th className="py-2 px-4 border-b">Profit</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                  <th className="py-2 px-4 border-b">Products</th> {/* New Header for Products */}
                </tr>
              </thead>
              <tbody>
                {storeOrders.map((order) => {
                  // Calculate total buying price
                  const totalBuyingPrice = order.products
                    ? order.products.reduce(
                        (sum, product) =>
                          sum +
                          (product.buyingPrice || 0) * (product.quantity || 0),
                        0
                      )
                    : 0;

                  // Calculate profit
                  const profit = (order.totalAmount || 0) - totalBuyingPrice;

                  const isExpanded = expandedOrders.has(order._id);

                  // Determine background color based on order status
                  const rowClasses = `text-center ${
                    order.approved
                      ? "bg-white text-black"
                      : "bg-yellow-100 text-gray-800"
                  } hover:bg-gray-200 transition-colors duration-200`;

                  return (
                    <React.Fragment key={order._id}>
                      <tr className={rowClasses}>
                        {/* Removed Order ID Cell */}
                        <td className="py-2 px-4 border-b">{order.code}</td>
                        <td className="py-2 px-4 border-b">
                          {order.customerName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {order.customerPhone}
                        </td>
                        {/* Display the image from the first product */}
                        <td className="py-2 px-4 border-b">
                          {order.products &&
                          order.products.length > 0 &&
                          order.products[0].productImage ? (
                            <Image
                              src={order.products[0].productImage}
                              alt="Product Image"
                              width={50}
                              height={50}
                              className="mx-auto"
                            />
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
                        {/* Buying Price Column */}
                        <td className="py-2 px-4 border-b">
                          {showSensitiveInfo ? (
                            `Tk. ${totalBuyingPrice.toFixed(2)}`
                          ) : (
                            <span className="text-gray-500">•••••</span>
                          )}
                        </td>
                        {/* Profit Column */}
                        <td className="py-2 px-4 border-b">
                          {showSensitiveInfo ? (
                            `Tk. ${profit.toFixed(2)}`
                          ) : (
                            <span className="text-gray-500">•••••</span>
                          )}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {order.approved ? (
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
                          {!order.approved && (
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
                        {/* Products Column */}
                        <td className="py-2 px-4 border-b">
                          {order.products && order.products.length > 1 ? (
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
                                  Hide Products <FaChevronUp className="ml-1" />
                                </>
                              ) : (
                                <>
                                  View Products <FaChevronDown className="ml-1" />
                                </>
                              )}
                            </button>
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                      </tr>
                      {/* Expanded Row for Products */}
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
                                    <th className="py-2 px-4 border-b">Image</th>
                                    <th className="py-2 px-4 border-b">
                                      Quantity
                                    </th>
                                    <th className="py-2 px-4 border-b">Color</th>
                                    <th className="py-2 px-4 border-b">Size</th>
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
                                          <Image
                                            src={product.productImage}
                                            alt={product.productName}
                                            width={50}
                                            height={50}
                                            className="mx-auto"
                                          />
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

        {/* Create Order Modal */}
        {selectedProductType && (
          <CreateOrderModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            productType={selectedProductType}
            onCreateOrder={handleCreateOrder}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStoreOrdersPage;
