// src/components/Admin/ClosedStoreOrders.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IStoreOrder } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
} from "react-icons/fa";
import Toast from "@/components/Toast/Toast";

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
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl focus:outline-none"
          aria-label="Close Image Modal"
        >
          <FaTimes />
        </button>
        <Image
          src={imageUrl}
          alt="Full Size Image"
          width={800}
          height={800}
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

const ClosedStoreOrders: React.FC = () => {
  const [storeOrders, setStoreOrders] = useState<IStoreOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State to manage visibility of sensitive information
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<boolean>(false);

  // State to manage expanded rows
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // State to manage image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] =
    useState<"success" | "error" | "warning">("success");

  // State for available years
  const [years, setYears] = useState<number[]>([]);
  const [yearsLoading, setYearsLoading] = useState<boolean>(true);

  // State for selected year
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Fetch available years
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const response = await axios.get<number[]>(
          "/api/storeOrders/closed/years"
        );
        setYears(response.data);
        if (response.data.length > 0) {
          setSelectedYear(response.data[0]); // Set the first available year
        }
      } catch (error: unknown) {
        console.error("Error fetching available years:", error);
        const message = getErrorMessage(error, "Failed to load available years.");
        setToastMessage(message);
        setToastType("error");
        setToastVisible(true);
      } finally {
        setYearsLoading(false);
      }
    };

    fetchAvailableYears();
  }, []);

  // Fetch closed store orders when selectedYear changes
  useEffect(() => {
    const fetchStoreOrders = async (year: number) => {
      setLoading(true);
      try {
        const response = await axios.get<IStoreOrder[]>(
          `/api/storeOrders/closed?year=${year}`
        );
        setStoreOrders(response.data);
      } catch (error: unknown) {
        console.error("Error fetching closed store orders:", error);
        setError("Failed to load closed store orders.");

        const message = getErrorMessage(
          error,
          "Failed to load closed store orders."
        );
        setToastMessage(message);
        setToastType("error");
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear !== null) {
      fetchStoreOrders(selectedYear);
    }
  }, [selectedYear]);

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

  // Function to handle year change
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
  };

  if (yearsLoading) {
    return (
      <div className="flex justify-center items-center h-16">
        <p>Loading available years...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16">
        <p>Loading closed store orders...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Closed Store Orders</h1>
        <div className="flex items-center space-x-2">
          {/* Year Selector */}
          {years.length > 0 ? (
            <select
              value={selectedYear || ""}
              onChange={handleYearChange}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg focus:outline-none"
              aria-label="Select Year"
              title="Select Year"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          ) : (
            <p>No data available</p>
          )}
          {/* Toggle Button for Sensitive Information */}
          <button
            onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none"
            aria-label={
              showSensitiveInfo
                ? "Hide sensitive information"
                : "Show sensitive information"
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

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={selectedImage}
        onClose={closeImageModal}
      />

      {/* Orders Table */}
      {storeOrders.length === 0 ? (
        <p>No closed store orders found for {selectedYear}.</p>
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
                <th className="py-2 px-4 border-b">Buying Price</th>
                <th className="py-2 px-4 border-b">Profit</th>
                <th className="py-2 px-4 border-b">Status</th>
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
                        (product.buyingPrice || 0) * (product.quantity || 0),
                      0
                    )
                  : 0;

                const profit = (order.totalAmount || 0) - totalBuyingPrice;

                const isExpanded = expandedOrders.has(order._id);

                const rowClasses = `text-center bg-gray-300 text-gray-600 hover:bg-gray-200 transition-colors duration-200`;

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
                              openImageModal(order.products[0].productImage)
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
                        <span className="text-red-600 font-semibold">
                          Closed
                        </span>
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
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="bg-gray-100">
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
    </div>
  );
};

export default ClosedStoreOrders;
