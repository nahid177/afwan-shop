"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import AdminLayout from "./AdminLayout";

const AdminPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Retrieve the token from cookies
    const token = Cookies.get("token");
    console.log("Checking token in AdminPage:", token);

    // If no token, redirect to login
    if (!token) {
      console.log("No token found, redirecting to login");
      router.push("/login");
    }
  }, [router]);

  return (
    <AdminLayout>
      <div>Admin Page Content goes here.</div>
    </AdminLayout>
  );
};

export default AdminPage;
