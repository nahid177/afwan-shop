// src/app/admin/product-types/[id]/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '@/components/Admin/product-types-page/ProductCard';
import AddCategoryModal from '@/components/Admin/product-types-page/AddCategoryModal';
import RenameCategoryModal from '@/components/Admin/product-types-page/RenameCategoryModal';
import DeleteCategoryModal from '@/components/Admin/product-types-page/DeleteCategoryModal';
import { FaPlus, FaShoppingCart } from 'react-icons/fa';
import { IProductType, IProductCategory, IStoreOrder, IProduct } from '@/types';
import Toast from '@/components/Toast/Toast';
import CreateOrderModal from '@/components/Admin/CreateOrderModal';
import AdminLayout from '@/app/admin/AdminLayout';
import AdminLayoutTypesName from '@/app/admin/product-types/AdminLayoutTypesName';

const ProductTypePage = ({ params }: { params: { id: string } }) => {
  const [productType, setProductType] = useState<IProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { id } = params;

  // Toast state
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  useEffect(() => {
    const fetchProductType = async () => {
      try {
        const response = await axios.get<IProductType>(`/api/product-types/${id}`);
        setProductType(response.data);
      } catch (error: unknown) {
        console.error('Error fetching product type:', error);
        setToastMessage('Error fetching product type.');
        setToastType('error');
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductType();
  }, [id]);

  // Function to handle adding a new category to the state
  const handleCategoryAdded = (newCategory: IProductCategory) => {
    if (productType) {
      setProductType({
        ...productType,
        product_catagory: [...productType.product_catagory, newCategory],
      });
      setToastMessage('Category added successfully.');
      setToastType('success');
      setToastVisible(true);
    }
  };

  // Function to delete a category
  const deleteCategory = async (categoryName: string) => {
    if (!productType) return;

    try {
      await axios.delete(`/api/product-types/${productType._id}`, {
        data: { categoryName },
      });
      // Update local state after deletion
      setProductType({
        ...productType,
        product_catagory: productType.product_catagory.filter(
          (category: { catagory_name: string; }) => category.catagory_name !== categoryName
        ),
      });
      setToastMessage('Category deleted successfully.');
      setToastType('success');
      setToastVisible(true);
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      setToastMessage('Failed to delete category.');
      setToastType('error');
      setToastVisible(true);
    }
  };

  // Function to rename a category
  const renameCategory = async (oldName: string, newName: string) => {
    if (!productType) return;

    try {
      await axios.patch(`/api/product-types/${productType._id}`, {
        oldCategoryName: oldName,
        newCategoryName: newName,
      });
      // Update local state after renaming
      setProductType({
        ...productType,
        product_catagory: productType.product_catagory.map((category: { catagory_name: string; }) =>
          category.catagory_name === oldName
            ? { ...category, catagory_name: newName }
            : category
        ),
      });
      setToastMessage('Category renamed successfully.');
      setToastType('success');
      setToastVisible(true);
    } catch (error: unknown) {
      console.error('Error renaming category:', error);
      setToastMessage('Failed to rename category.');
      setToastType('error');
      setToastVisible(true);
    }
  };

  // Function to handle order creation
  const handleCreateOrder = async (orderData: Omit<IStoreOrder, '_id'>) => {
    try {
      await axios.post<IStoreOrder>('/api/storeOrders', orderData);
      setToastMessage('Store order created successfully.');
      setToastType('success');
      setToastVisible(true);
      // Optionally, reset selected products or close modal
    } catch (error: unknown) {
      console.error('Error creating store order:', error);
      setToastMessage('Failed to create store order.');
      setToastType('error');
      setToastVisible(true);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminLayoutTypesName>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading...</p>
          </div>
        </AdminLayoutTypesName>
      </AdminLayout>
    );
  }

  if (!productType) {
    return (
      <AdminLayout>
        <AdminLayoutTypesName>
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Product type not found.</p>
          </div>
        </AdminLayoutTypesName>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminLayoutTypesName>
        <div className="container mx-auto p-6">
          {/* Toast Notifications */}
          {toastVisible && (
            <div className="fixed top-4 right-4 z-50">
              <Toast
                type={toastType}
                message={toastMessage}
                onClose={() => setToastVisible(false)}
              />
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{productType.types_name}</h1>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FaPlus className="mr-2" /> Add Category
              </button>
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <FaShoppingCart className="mr-2" /> Create Order
              </button>
            </div>
          </div>

          {/* Display products under each category */}
          {productType.product_catagory.map((category: IProductCategory) => (            <div key={category.category_name} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{category.category_name}</h2>
                <div>
                  {/* Rename Category Button */}
                  <button
                    onClick={() => {
                      setSelectedCategory(category.category_name);
                      setIsRenameModalOpen(true);
                    }}
                    className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Rename
                  </button>
                  {/* Delete Category Button */}
                  <button
                    onClick={() => {
                      setSelectedCategory(category.category_name);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.product.map((product: IProduct) => (
                  <ProductCard
                    key={product._id ? product._id.toString() : product.product_name}
                    product={product}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminLayoutTypesName>

      {/* Add Category Modal */}
      {isAddModalOpen && productType && (
        <AddCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          productTypeId={productType._id ? productType._id.toString() : ''}
          onCategoryAdded={handleCategoryAdded}
        />
      )}

      {/* Rename Category Modal */}
      {isRenameModalOpen && productType && (
        <RenameCategoryModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          currentName={selectedCategory}
          onRename={renameCategory}
        />
      )}

      {/* Delete Category Modal */}
      {isDeleteModalOpen && productType && (
        <DeleteCategoryModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          categoryName={selectedCategory}
          onDelete={deleteCategory}
        />
      )}

      {/* Create Order Modal */}
      {isOrderModalOpen && productType && (
        <CreateOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          productType={productType}
          onCreateOrder={handleCreateOrder}
        />
      )}
    </AdminLayout>
  );
};

export default ProductTypePage;
