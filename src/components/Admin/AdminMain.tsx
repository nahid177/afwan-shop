// src/app/admin/product-types/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import ProductTypesNavbar from '@/components/Admin/product-types-page/ProductTypesNavbar';
import axios from 'axios';
import { FaBoxOpen, FaShoppingCart } from 'react-icons/fa';
import AdminLayout from '@/app/admin/AdminLayout';

interface ApiTotalSoldResponse {
  totalSold: number;
}

const AdminMain = () => {
  const [totalProductQuantity, setTotalProductQuantity] = useState<number>(0);
  const [totalProductsSold, setTotalProductsSold] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [quantityResponse, soldResponse] = await Promise.all([
          axios.get<number>('/api/products/total-quantity'),
          axios.get<ApiTotalSoldResponse>('/api/products/total-sold'),
        ]);

        setTotalProductQuantity(quantityResponse.data);
        setTotalProductsSold(soldResponse.data.totalSold); // Access the `totalSold` property
      } catch (error) {
        console.error('Error fetching totals:', error);
        setError('Error fetching totals');
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4">
          <p>Loading totals...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4">
          <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Include your existing ProductTypesNavbar component */}
      <ProductTypesNavbar />
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow flex items-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <FaBoxOpen className="text-blue-500 text-4xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Product Quantity</h2>
              <p className="text-3xl font-bold">{totalProductQuantity}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex items-center">
            <div className="p-4 bg-green-100 rounded-full">
              <FaShoppingCart className="text-green-500 text-4xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-700">Total Products Sold</h2>
              <p className="text-3xl font-bold">{totalProductsSold}</p>
            </div>
          </div>
        </div>
        {/* Additional dashboard content can be added here */}
      </div>
    </AdminLayout>
  );
};

export default AdminMain;
