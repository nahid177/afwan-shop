// src/components/Admin/EditOrderModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { IOrder } from "@/models/Order";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder;
  onSave: (updatedData: Partial<IOrder>) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ isOpen, onClose, order, onSave }) => {
  const [customerName, setCustomerName] = useState<string>(order.customerName);
  const [customerNumber, setCustomerNumber] = useState<string>(order.customerNumber);
  const [address1, setAddress1] = useState<string>(order.address1);
  const [address2, setAddress2] = useState<string>(order.address2 || "");
  const [otherNumber, setOtherNumber] = useState<string>(order.otherNumber || "");

  useEffect(() => {
    if (isOpen) {
      setCustomerName(order.customerName);
      setCustomerNumber(order.customerNumber);
      setAddress1(order.address1);
      setAddress2(order.address2 || "");
      setOtherNumber(order.otherNumber || "");
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: Partial<IOrder> = {
      customerName,
      customerNumber,
      address1,
      address2,
      otherNumber,
      // Add other fields if necessary
    };
    onSave(updatedData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Order</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Customer Number</label>
            <input
              type="text"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Address Line 1</label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Address Line 2</label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Other Number</label>
            <input
              type="text"
              value={otherNumber}
              onChange={(e) => setOtherNumber(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </div>
          {/* Example: Status Dropdown */}
          <div className="mb-4">
          
          </div>
          {/* Add more fields as necessary */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
