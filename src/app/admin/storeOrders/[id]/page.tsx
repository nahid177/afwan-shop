// src/app/admin/storeOrders/[id]/page.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { IStoreOrder } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast/Toast";
import ConfirmationModal from "@/components/Admin/ConfirmationModal";
import AdminLayout from "../../AdminLayout";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";

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

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex"
      onClick={handleBackdropClick}
    >
      <div className="relative p-8 bg-white w-full max-w-4xl m-auto flex-col flex rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close Modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  );
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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Ref for the receipt component
  const receiptRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt_${orderId}`,
  });

  // PDF handler
  const handleDownloadPdf = async () => {
    if (!receiptRef.current) {
      setToast({
        visible: true,
        message: "The receipt is not fully loaded.",
        type: "error",
      });
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const dataUrl = await domtoimage.toPng(receiptRef.current, {
        useCORS: true, // 'useCORS' is now recognized due to type extension
        bgcolor: "#FFFFFF",
      });
      const pdf = new jsPDF("p", "mm", "a4");

      // Calculate dimensions
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add image to PDF
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setIsPdfModalOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setToast({
        visible: true,
        message: "Failed to generate PDF.",
        type: "error",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Clean up the Blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    const fetchStoreOrder = async () => {
      setLoading(true);
      try {
        const response = await axios.get<IStoreOrder>(
          `/api/storeOrders/${orderId}`
        );
        setStoreOrder(response.data);
      } catch (error: unknown) {
        console.error("Error fetching store order:", error);
        const message = getErrorMessage(
          error,
          "Failed to load order details."
        );
        setToast({
          visible: true,
          message: message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreOrder();
  }, [orderId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/storeOrders/${orderId}`);
      setToast({
        visible: true,
        message: "Order deleted successfully.",
        type: "success",
      });
      router.push("/admin/storeOrders");
    } catch (error: unknown) {
      console.error("Error deleting store order:", error);
      const message = getErrorMessage(
        error,
        "Failed to delete order."
      );
      setToast({
        visible: true,
        message: message,
        type: "error",
      });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-16">
          <p>Loading store order details...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() =>
              setToast({ ...toast, visible: false })
            }
          />
        </div>
      )}

      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-semibold">Store Order Details</h1>
        {/* Action Buttons */}
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button
            onClick={() => handlePrint()} // Wrapped in arrow function to match MouseEventHandler
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Print Receipt
          </button>
          <button
            onClick={handleDownloadPdf}
            className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center ${
              isGeneratingPdf ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"
                  viewBox="0 0 24 24"
                ></svg>
                Generating...
              </>
            ) : (
              "Download PDF"
            )}
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete Order
          </button>
        </div>
      </div>

      {/* Receipt Component */}
      {storeOrder && (
        <div className="mt-8 flex justify-center">
          <div ref={receiptRef} className="w-full max-w-3xl">
            <Receipt storeOrder={storeOrder} />
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="PDF Preview"
      >
        {pdfUrl ? (
          <div className="flex flex-col items-center">
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              title="Store Order PDF"
              className="border rounded mb-4"
            />
            <a
              href={pdfUrl}
              download={`Receipt_${orderId}.pdf`}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Download PDF
            </a>
          </div>
        ) : (
          <p>Loading PDF...</p>
        )}
      </Modal>

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

// Receipt Component with Inline SVG to Bypass CORS
interface ReceiptProps {
  storeOrder: IStoreOrder;
}

const Receipt: React.FC<ReceiptProps> = ({ storeOrder }) => {
  return (
    <div
      className="p-6 border border-gray-300 rounded shadow-md bg-white"
      style={{ backgroundColor: "#f9f9f9" }}
    >
      {/* Header with Inline SVG Logo */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Inline SVG Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="60"
            viewBox="0 0 120 60"
            fill="none"
          >
            {/* Replace the content below with your actual SVG markup */}
            <rect width="120" height="60" fill="#ffffff" />
            <text
              x="60"
              y="35"
              textAnchor="middle"
              fill="#000000"
              fontSize="24"
              fontFamily="Arial, sans-serif"
            >
              AFWAN
            </text>
            {/* End of SVG Content */}
          </svg>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Money Receipt</p>
          <p className="text-sm text-gray-600">
            Receipt ID: {storeOrder._id}
          </p>
        </div>
      </div>

      {/* Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p>
            <strong>Date:</strong>{" "}
            {storeOrder.createdAt
              ? new Date(storeOrder.createdAt).toLocaleDateString()
              : ""}
          </p>
          <p>
            <strong>Customer Name:</strong> {storeOrder.customerName}
          </p>
        </div>
        <div>
          <p>
            <strong>Phone:</strong> {storeOrder.customerPhone}
          </p>
          <p>
            <strong>Email:</strong> {storeOrder.customerEmail || "N/A"}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Color</th>
              <th className="py-2 px-4 border-b">Size</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Price (Tk.)</th>
              <th className="py-2 px-4 border-b">Total (Tk.)</th>
            </tr>
          </thead>
          <tbody>
            {storeOrder.products.map((product, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{product.productName}</td>
                <td className="py-2 px-4 border-b">
                  {product.color || "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  {product.size || "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  {product.quantity}
                </td>
                <td className="py-2 px-4 border-b">
                  {product.offerPrice.toFixed(2)}
                </td>
                <td className="py-2 px-4 border-b">
                  {(product.offerPrice * product.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Amount */}
      <div className="flex justify-end mt-4">
        <div className="w-1/3">
          <p className="text-lg font-semibold">
            Total Amount: Tk. {storeOrder.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Thank you for your purchase!</p>
        <p>Visit us again at www.afwanshop.com</p>
      </div>
    </div>
  );
};

export default AdminStoreOrderDetailsPage;
