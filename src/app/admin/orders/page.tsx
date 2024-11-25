// src/app/admin/orders/page.tsx

"use client";

import React, { useState } from "react";
import AdminLayout from "../AdminLayout";
import OpenOrders from "@/components/Admin/OpenOrders";
import ClosedOrders from "@/components/Admin/ClosedOrders";

const AdminOrdersPage: React.FC = () => {
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
            Open Orders
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "closed"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => setActiveTab("closed")}
          >
            Closed Orders
          </button>
        </div>

        {/* Content */}
        {activeTab === "open" ? <OpenOrders /> : <ClosedOrders />}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
