// src/components/Admin/ClosedStoreOrders.tsx

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IStoreOrder } from "@/types";
import Image from "next/image";

import {
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaDownload, // Import FaDownload icon
} from "react-icons/fa";
import Toast from "@/components/Toast/Toast";
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable, { Options as AutoTableOptions } from "jspdf-autotable"; // Corrected import

// Define types for table rows
type MainTableRow = [
  string, // Code
  string, // Customer Name
  string, // Phone
  string, // Total Amount
  string, // Buying Price or placeholder
  string, // Profit or placeholder
  string  // Status
];

type ProductTableRow = [
  string, // Product Name
  string, // Product Code
  string, // Quantity
  string, // Color
  string, // Size
  string, // Buying Price
  string  // Offer Price
];

// Extend jsPDF interface to include lastAutoTable
interface ExtendedjsPDF extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Define a type for the didDrawPage hook parameter
interface HookData {
  pageNumber: number;
  pageCount: number;
  settings: {
    margin: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  };
}

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
        const message = getErrorMessage(
          error,
          "Failed to load available years."
        );
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

  // Function to toggle expanded orders
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
  const handleYearChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
  };

  // Function to generate and download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF() as ExtendedjsPDF;

    // Title
    doc.setFontSize(18);
    doc.text(`Closed Store Orders Report - ${selectedYear}`, 14, 22);

    // Define main table columns
    const mainTableColumn: string[] = [
      "Code",
      "Customer Name",
      "Phone",
      "Total Amount",
      "Buying Price",
      "Profit",
      "Status",
    ];

    // Prepare main table rows
    const mainTableRows: MainTableRow[] = storeOrders.map((order) => {
      // Calculate buying price and profit
      const totalBuyingPrice = order.products
        ? order.products.reduce(
            (sum, product) =>
              sum + (product.buyingPrice ?? 0) * (product.quantity ?? 0),
            0
          )
        : 0;

      const profit = (order.totalAmount ?? 0) - totalBuyingPrice;

      return [
        order.code,
        order.customerName,
        order.customerPhone,
        `Tk. ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}`,
        showSensitiveInfo
          ? `Tk. ${totalBuyingPrice.toFixed(2)}`
          : "•••••",
        showSensitiveInfo ? `Tk. ${profit.toFixed(2)}` : "•••••",
        "Closed", // Assuming all are closed
      ];
    });

    // Define main AutoTable options
    const mainTableOptions: AutoTableOptions = {
      startY: 30,
      head: [mainTableColumn],
      body: mainTableRows,
      styles: {
        fontSize: 10,
        textColor: 0, // Black text
        lineColor: 0, // Black lines
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255], // White background for headers
        textColor: 0, // Black text
        halign: 'center',
      },
      bodyStyles: {
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light grey for alternate rows
      },
      theme: "striped",
      didDrawPage: (data: HookData) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    };

    // Add main AutoTable
    autoTable(doc, mainTableOptions);

    // Starting Y position after the main table
    let finalY = doc.lastAutoTable.finalY + 10;

    // Iterate over each store order to add detailed product tables
    storeOrders.forEach((order) => {
      // Add order-specific heading
      doc.setFontSize(14);
      doc.text(`Order: ${order.code} - ${order.customerName}`, 14, finalY);
      finalY += 6;

      // Define product table columns
      const productTableColumn: string[] = [
        "Product Name",
        "Product Code",
        "Quantity",
        "Color",
        "Size",
        "Buying Price",
        "Offer Price",
      ];

      // Prepare product table rows
      const productTableRows: ProductTableRow[] = order.products.map((product) => [
        product.productName,
        product.productCode,
        product.quantity.toString(),
        product.color || "N/A",
        product.size || "N/A",
        `Tk. ${product.buyingPrice?.toFixed(2) ?? "0.00"}`,
        `Tk. ${product.offerPrice.toFixed(2)}`,
      ]);

      // Define product AutoTable options
      const productTableOptions: AutoTableOptions = {
        startY: finalY,
        head: [productTableColumn],
        body: productTableRows,
        styles: {
          fontSize: 9,
          textColor: 0, // Black text
          lineColor: 0, // Black lines
          lineWidth: 0.05,
        },
        headStyles: {
          fillColor: [255, 255, 255], // White background for headers
          textColor: 0, // Black text
          halign: 'center',
        },
        bodyStyles: {
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245], // Slightly lighter grey for alternate rows
        },
        theme: "striped",
        margin: { left: 14, right: 14 },
        showHead: 'everyPage',
        didDrawPage: (data: HookData) => {
          // Footer
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      };

      // Add product AutoTable
      autoTable(doc, productTableOptions);

      // Update finalY for the next table
      finalY = doc.lastAutoTable.finalY + 10;
    });

    // Save the PDF
    doc.save(`Closed_Store_Orders_${selectedYear}.pdf`);

    // Show success toast
    setToastMessage("PDF downloaded successfully!");
    setToastType("success");
    setToastVisible(true);
  };

  // Loading States
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

  // Error State
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">Closed Store Orders</h1>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
          {/* Year Selector */}
          {years.length > 0 ? (
            <select
              value={selectedYear ?? ""}
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
          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
            aria-label="Download PDF"
            title="Download Closed Store Orders as PDF"
          >
            <FaDownload className="mr-2" />
            Download PDF
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
                // Calculations
                const totalBuyingPrice = order.products
                  ? order.products.reduce(
                      (sum, product) =>
                        sum +
                        (product.buyingPrice ?? 0) * (product.quantity ?? 0),
                      0
                    )
                  : 0;

                const profit = (order.totalAmount ?? 0) - totalBuyingPrice;

                const isExpanded = expandedOrders.has(order._id);

                // Table row styles
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
                          <span
                            className={`${
                              profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            Tk. {profit.toFixed(2)}
                          </span>
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
                                      Tk. {product.buyingPrice?.toFixed(2) ?? "0.00"}
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
