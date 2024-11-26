// src/app/admin/product-types/page.tsx
 "use client";
import React, { useEffect, useState } from 'react';
import AdminLayout from '../AdminLayout';
import ProductTypesNavbar from '@/components/Admin/product-types-page/ProductTypesNavbar';
import axios from 'axios';

const Page = () => {
  const [totalProductQuantity, setTotalProductQuantity] = useState<number>(0);
  const [totalProductsSold, setTotalProductsSold] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [quantityResponse, soldResponse] = await Promise.all([
          axios.get<number>('/api/products/total-quantity'),
          axios.get<number>('/api/products/total-sold'),
        ]);

        setTotalProductQuantity(quantityResponse.data);
        setTotalProductsSold(soldResponse.data);
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
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Total Product Quantity</h2>
            <p className="text-3xl">{totalProductQuantity}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Total Products Sold</h2>
            <p className="text-3xl">{totalProductsSold}</p>
          </div>
        </div>
      
      </div>
    </AdminLayout>
  );
};

export default Page;
