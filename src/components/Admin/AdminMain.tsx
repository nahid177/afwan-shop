"use client";
import React, { useEffect, useState } from 'react';
import ProductTypesNavbar from '@/components/Admin/product-types-page/ProductTypesNavbar';
import axios from 'axios';
import { FaBoxOpen, FaShoppingCart } from 'react-icons/fa';
import AdminLayout from '@/app/admin/AdminLayout';
import ProductCardsc from '@/components/Admin/product-types-page/ProductCardsc';
import { IProduct } from '@/types'; // Import the IProduct type

interface ApiTotalSoldResponse {
  totalSold: number;
}

const AdminMain = () => {
  const [totalProductQuantity, setTotalProductQuantity] = useState<number>(0);
  const [totalProductsSold, setTotalProductsSold] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(""); // For the search input
  const [productResults, setProductResults] = useState<IProduct[]>([]); // Use IProduct[] instead of any[]

  // Fetch the product totals
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [quantityResponse, soldResponse] = await Promise.all([
          axios.get<number>('/api/products/total-quantity'),
          axios.get<ApiTotalSoldResponse>('/api/products/total-sold'),
        ]);
        setTotalProductQuantity(quantityResponse.data);
        setTotalProductsSold(soldResponse.data.totalSold);
      } catch (error) {
        console.error('Error fetching totals:', error);
        setError('Error fetching totals');
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounced search (added a small delay)
    if (query) {
      try {
        const response = await axios.get(`/api/products/search?query=${query}`);
        if (response.status === 200) {
          setProductResults(response.data.slice(0, 1)); // Show only the first result
        } else {
          setProductResults([]); // Clear results if no products found
        }
      } catch (error) {
        console.error('Error searching for products:', error);
        setError('Error searching for products');
        setProductResults([]); // Ensure the result is cleared on error
      }
    } else {
      setProductResults([]); // Clear results if search query is empty
    }
  };

  const handleBarcodeScan = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Barcode scanner inputs directly into the search field
    const barcode = event.target.value;
    setSearchQuery(barcode); // Update search query with barcode
    handleSearchChange(event); // Trigger the search change with the scanned barcode
  };

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
      <ProductTypesNavbar />
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange} // Handle normal text input
            onInput={handleBarcodeScan} // Handle barcode input as well
            placeholder="Search by barcode or product name..."
            className="px-4 py-2 border rounded-lg w-full"
          />
        </div>

        {/* Dashboard Stats */}
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

        {/* Show filtered products */}
        {productResults.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productResults.map((product) => (
                <ProductCardsc
                  key={String(product._id)} // Ensure that the key is a string
                  product={product} orderId={''}                
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">No product found matching your search.</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMain;
