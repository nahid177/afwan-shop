import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Toast from "@/components/Toast/Toast";
import ConfirmationModal from "@/components/Admin/ConfirmationModal";
import Image from "next/image";
import {
  FaEye,
  FaEyeSlash,
  FaPrint
} from "react-icons/fa";

interface IStoreOrder {
  _id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  approved: boolean;
  createdAt: string;
  products: {
    productName: string;
    color?: string;
    size?: string;
    quantity: number;
    offerPrice: number;
    buyingPrice?: number;
    productImage?: string;
  }[];
}

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

  // State to manage visibility of sensitive information
  const [showSensitiveInfo, setShowSensitiveInfo] =
    useState<boolean>(false);

  // State to manage image modal visibility
  const [, setIsImageModalOpen] = useState<boolean>(false);

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

  const handlePrint = (orderId: string) => {
    const order = storeOrders.find((order) => order._id === orderId);

    if (!order) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (printWindow) {
      const receiptContent = `
        <html>
          <head>
            <title>Receipt ${order.code}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .receipt { width: 80mm; font-size: 12px; color: black; background-color: white; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <h1 style="text-align: center;">Afwan Money Receipt</h1>
              <p><strong>Receipt ID:</strong> ${order.code}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Customer Name:</strong> ${order.customerName}</p>
              <p><strong>Phone:</strong> ${order.customerPhone}</p>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Price (Tk.)</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.products.map((product) => `
                    <tr>
                      <td>${product.productName}</td>
                      <td>${product.color || "N/A"}</td>
                      <td>${product.size || "N/A"}</td>
                      <td>${product.quantity}</td>
                      <td>${product.offerPrice.toFixed(0)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <p style="font-size: 12px;"><strong>Total Amount:</strong> Tk. ${order.totalAmount.toFixed(0)}</p>
              <p style="text-align: center;">Thank you for your purchase!</p>
              <p style="text-align: center;">Visit us again at www.afwan.shop</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
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
                <th className="py-2 px-4 border-b">Code</th>
                <th className="py-2 px-4 border-b">Customer Name</th>
                <th className="py-2 px-4 border-b">Phone</th>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b">Total Amount</th>
                <th className="py-2 px-4 border-b">
                  <div className="flex items-center justify-center">
                    Buying Price
                    <button
                      onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
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
                const totalBuyingPrice = order.products
                  ? order.products.reduce(
                      (sum, product) =>
                        sum +
                        ((product.buyingPrice || 0) * (product.quantity || 0)),
                      0
                    )
                  : 0;

                const profit =
                  (order.totalAmount || 0) - totalBuyingPrice;

                const rowClasses = `text-center ${
                  order.status === "closed"
                    ? "bg-gray-300 text-gray-600"
                    : order.approved
                    ? "bg-white text-black"
                    : "bg-yellow-100 text-gray-800"
                } hover:bg-gray-200 transition-colors duration-200`;

                return (
                  <tr className={rowClasses} key={order._id}>
                    <td className="py-2 px-4 border-b">{order.code}</td>
                    <td className="py-2 px-4 border-b">{order.customerName}</td>
                    <td className="py-2 px-4 border-b">{order.customerPhone}</td>
                    <td className="py-2 px-4 border-b">
                      {order.products &&
                      order.products.length > 0 &&
                      order.products[0].productImage ? (
                        <button
                          onClick={() =>
                            setIsImageModalOpen(true)
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
                      Tk. {order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {showSensitiveInfo ? (
                        <>Tk. {totalBuyingPrice.toFixed(2)}</>
                      ) : (
                        <span className="text-gray-500">•••••</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {showSensitiveInfo ? (
                        <>Tk. {profit.toFixed(2)}</>
                      ) : (
                        <span className="text-gray-500">•••••</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {order.status === "closed" ? (
                        <span className="text-red-600 font-semibold">Closed</span>
                      ) : order.approved ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <Link href={`/admin/storeOrders/${order._id}`}>
                        <button className="mr-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                          View
                        </button>
                      </Link>
                      {!order.approved && order.status !== "closed" && (
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
                        className="mr-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        aria-label={`Delete order ${order.code}`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handlePrint(order._id)}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        aria-label={`Print order ${order.code}`}
                      >
                        <FaPrint />
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {order.products && order.products.length > 0 ? (
                        <button
                          onClick={() => {}}
                          className="flex items-center justify-center px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          View Products
                        </button>
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                  </tr>
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
    </div>
  );
};

export default OpenStoreOrders;
