// src/components/Admin/product-types-page/RenameCategoryModal.tsx

import React, { useState } from 'react';

interface RenameCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (oldName: string, newName: string) => void;
}

const RenameCategoryModal: React.FC<RenameCategoryModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onRename,
}) => {
  const [newName, setNewName] = useState<string>(currentName);
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    if (!newName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    if (newName === currentName) {
      setError('New category name must be different.');
      return;
    }
    onRename(currentName, newName.trim());
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
            <h2 className="text-xl font-semibold mb-4">Rename Category</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
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
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RenameCategoryModal;
