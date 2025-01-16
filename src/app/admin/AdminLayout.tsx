"use client";
import React from "react";
import AdminNavbar from "@/components/Admin/AdminNavbar";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="re min-h-screen flex flex-col">
      {/* Admin Navbar */}
      <AdminNavbar />
      {/* Page Content */}
      <div className=" flex-1 p-4 bg-gray-100">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
