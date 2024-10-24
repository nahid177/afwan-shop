// src/app/admin/product-types/[id]/page.tsx

"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../AdminLayout';
import ProductCard from '@/components/Admin/product-types-page/ProductCard';
import AdminLayoutTypesName from '../AdminLayoutTypesName';
import AddCategoryModal from '@/components/Admin/product-types-page/AddCategoryModal';
import RenameCategoryModal from '@/components/Admin/product-types-page/RenameCategoryModal';
import DeleteCategoryModal from '@/components/Admin/product-types-page/DeleteCategoryModal';
import { FaPlus } from 'react-icons/fa';
import { IProductType, IProductCategory } from '@/types'; // Import interfaces from types.ts

const ProductTypePage = ({ params }: { params: { id: string } }) => {
  const [productType, setProductType] = useState<IProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { id } = params;

  useEffect(() => {
    const fetchProductType = async () => {
      try {
        const response = await axios.get<IProductType>(`/api/product-types/${id}`);
        setProductType(response.data);
      } catch (error) {
        console.error('Error fetching product type:', error);
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
          (category) => category.catagory_name !== categoryName
        ),
      });
    } catch (error) {
      console.error('Error deleting category:', error);
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
        product_catagory: productType.product_catagory.map((category) =>
          category.catagory_name === oldName
            ? { ...category, catagory_name: newName }
            : category
        ),
      });
    } catch (error) {
      console.error('Error renaming category:', error);
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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{productType.types_name}</h1>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Add Category
            </button>
          </div>

          {/* Display products under each category */}
          {productType.product_catagory.map((category) => (
            <div key={category.catagory_name} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{category.catagory_name}</h2>
                <div>
                  {/* Rename Category Button */}
                  <button
                    onClick={() => {
                      setSelectedCategory(category.catagory_name);
                      setIsRenameModalOpen(true);
                    }}
                    className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Rename
                  </button>
                  {/* Delete Category Button */}
                  <button
                    onClick={() => {
                      setSelectedCategory(category.catagory_name);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.product.map((product) => (
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
    </AdminLayout>
  );
};

export default ProductTypePage;
