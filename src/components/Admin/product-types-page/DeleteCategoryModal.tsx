// src/components/Admin/product-types-page/DeleteCategoryModal.tsx

import React from 'react';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onDelete: (categoryName: string) => void;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  onDelete,
}) => {
  const handleDelete = () => {
    onDelete(categoryName);
    onClose();
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
            <h2 className="text-xl font-semibold mb-4">Delete Category</h2>
            <p className="mb-4">
              Are you sure you want to delete the category{' '}
              <strong>{categoryName}</strong>?
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

export default DeleteCategoryModal;
