// src/components/Admin/EditStatusModal.tsx

"use client";

import React, { useState, useEffect } from "react";

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onSave: (newStatus: string) => void;
}

const EditStatusModal: React.FC<EditStatusModalProps> = ({ isOpen, onClose, currentStatus, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/3">
        <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select New Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedStatus)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStatusModal;
