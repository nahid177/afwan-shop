// src/components/Admin/product-types-page/DeleteProductTypeModal.tsx

import React from 'react';
import { IProductType } from '@/types'; // Import interface from types.ts

interface DeleteProductTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: IProductType;
  onDelete: (_id: string) => void;
}

const DeleteProductTypeModal: React.FC<DeleteProductTypeModalProps> = ({
  isOpen,
  onClose,
  productType,
  onDelete,
}) => {
  const handleDelete = () => {
    if (productType._id) {
      onDelete(productType._id.toString());
      onClose();
    } else {
      console.error('Product type _id is undefined');
      // Optionally, you can show an error message to the user or handle this case appropriately
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <div
            className="bg-white p-6 rounded shadow-md w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Delete Product Type</h2>
            <p className="mb-4">
              Are you sure you want to delete the product type{' '}
              <strong>{productType.types_name}</strong>?
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 mr-2 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteProductTypeModal;
