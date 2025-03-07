"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IStoreOrder } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast/Toast";
import ConfirmationModal from "@/components/Admin/ConfirmationModal";
import AdminLayout from "@/app/admin/AdminLayout";

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

// Inside AdminStoreOrderDetailsPage Component

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

  const handleOpenPrintPage = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow && storeOrder) {
      const receiptContent = `
        <html>
          <head>
            <title>Receipt ${storeOrder._id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .receipt { width: 82mm; font-size: 12px; color: black; background-color: white; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <h1 style="text-align: center;">Money Receipt</h1>
              <p><strong>Receipt ID:</strong> ${storeOrder._id}</p>
<p><strong>Date:</strong> {storeOrder.createdAt ? new Date(storeOrder.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><strong>Customer Name:</strong> ${storeOrder.customerName}</p>
              <p><strong>Phone:</strong> ${storeOrder.customerPhone}</p>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Price (Tk.)</th>
                    <th>Total (Tk.)</th>
                  </tr>
                </thead>
                <tbody>
                  ${storeOrder.products.map(product => `
                    <tr>
                      <td>${product.productName}</td>
                      <td>${product.color || "N/A"}</td>
                      <td>${product.size || "N/A"}</td>
                      <td>${product.quantity}</td>
                      <td>${product.offerPrice.toFixed(2)}</td>
                      <td>${(product.offerPrice * product.quantity).toFixed(2)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <p><strong>Total Amount:</strong> Tk. ${storeOrder.totalAmount.toFixed(2)}</p>
              <p style="text-align: center;">Thank you for your purchase!</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
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
            onClick={handleOpenPrintPage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Print Receipt in New Window
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
          <div className="w-full max-w-3xl receipt">
            <Receipt storeOrder={storeOrder} />
          </div>
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
      className="p-6 border border-gray-300 rounded shadow-md bg-white receipt"
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
        <p>Visit us again at www.afwan.shop</p>
      </div>
    </div>
  );
};

export default AdminStoreOrderDetailsPage;
