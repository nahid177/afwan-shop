// src/app/admin/storeOrders/page.tsx

"use client";

import React, { useState } from "react";
import OpenStoreOrders from "@/components/OpenStoreOrders";
import ClosedStoreOrders from "@/components/ClosedStoreOrders";
import AdminLayout from "@/app/admin/AdminLayout";


const AdminStoreOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");

  return (
    <AdminLayout>
      <div className="p-4">
        {/* Tabs */}
        <div className="mb-4">
          <button
            className={`px-4 py-2 mr-2 ${
              activeTab === "open"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => setActiveTab("open")}
          >
            Open Store Orders
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "closed"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => setActiveTab("closed")}
          >
            Closed Store Orders
          </button>
        </div>

        {/* Content */}
        {activeTab === "open" ? <OpenStoreOrders /> : <ClosedStoreOrders />}
      </div>
    </AdminLayout>
  );
};

export default AdminStoreOrdersPage;
