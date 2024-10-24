// src/components/Admin/product-types-page/EditProductTypeModal.tsx

import React, { useState } from 'react';
import { IProductType } from '@/types'; // Import interface from types.ts

interface EditProductTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: IProductType;
  onSave: (updatedType: IProductType) => void;
}

const EditProductTypeModal: React.FC<EditProductTypeModalProps> = ({
  isOpen,
  onClose,
  productType,
  onSave,
}) => {
  const [typesName, setTypesName] = useState<string>(productType.types_name);
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    if (!typesName.trim()) {
      setError('Type name cannot be empty.');
      return;
    }
    onSave({ ...productType, types_name: typesName.trim() });
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
            <h2 className="text-xl font-semibold mb-4">Edit Product Type</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              value={typesName}
              onChange={(e) => {
                setTypesName(e.target.value);
                setError('');
              }}
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 mr-2 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProductTypeModal;
