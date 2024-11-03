// src/components/Admin/StoreOrderList.tsx

import React from 'react';
import Link from 'next/link';
import { useStoreOrders } from '@/hooks/useStoreOrders';

const StoreOrderList: React.FC = () => {
  const { storeOrders, loading, error } = useStoreOrders();

  if (loading) return <p>Loading store orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Store Orders</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Total Amount</th>
            {/* Removed Status Column */}
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {storeOrders.map(order => (
            <tr key={order._id as string}>
              <td className="border px-4 py-2">{order._id}</td>
              <td className="border px-4 py-2">{order.customerName}</td>
              <td className="border px-4 py-2">{order.totalAmount}</td>
              {/* Removed Status Data Cell */}
              <td className="border px-4 py-2">
                <Link href={`/admin/storeOrders/${order._id}`}>
                  <button className="mr-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View
                  </button>
                </Link>
                {/* If you plan to add more actions, you can include them here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StoreOrderList;
