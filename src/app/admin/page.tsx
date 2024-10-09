"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/Admin/AdminNavbar";
import Cookies from "js-cookie";

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
    <div>
      <AdminNavbar />
      <div>Admin Page Content</div>
    </div>
  );
};

export default AdminPage;
