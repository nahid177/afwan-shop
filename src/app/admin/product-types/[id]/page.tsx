// src/app/admin/product-types/[id]/page.tsx

"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../AdminLayout';
import ProductCard from '@/components/Admin/product-types-page/ProductCard';
import AdminLayoutTypesName from '../AdminLayoutTypesName';
import AddCategoryModal from '@/components/Admin/product-types-page/AddCategoryModal';
import { FaPlus } from 'react-icons/fa';
import { IProductType, IProductCategory } from '@/types'; // Import interfaces from types.ts

const ProductTypePage = ({ params }: { params: { id: string } }) => {
  const [productType, setProductType] = useState<IProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Add Category
            </button>
          </div>

          {/* Display products under each category */}
          {productType.product_catagory.map((category) => (
            <div
              key={category.catagory_name}
              className="mb-8"
            >
              <h2 className="text-2xl font-semibold mb-4">{category.catagory_name}</h2>
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
      {isModalOpen && productType && (
        <AddCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productTypeId={productType._id ? productType._id.toString() : ''}
          onCategoryAdded={handleCategoryAdded}
        />
      )}
    </AdminLayout>
  );
};

export default ProductTypePage;
