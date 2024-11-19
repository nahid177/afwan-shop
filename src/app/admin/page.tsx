"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import useSWR from "swr";
import AdminLayout from "./AdminLayout";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  sentStatsCount: number;
}

interface ApiAdminStatsResponse {
  totalRegistrations: number;
  totalLogins: number;
  userSentMessagesNotSeen: number;
}

const fetcher = (url: string, token: string | null) => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  });
};

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const token = Cookies.get("token") || null;

  const { data: statsData, error: statsError } = useSWR<ApiAdminStatsResponse>(
    token ? ["/api/admin/stats", token] : null,
    ([url, token]: [string, string | null]) => fetcher(url, token),
    { refreshInterval: 1000, dedupingInterval: 1000 } // Increased interval for performance
  );
  
  const { data: usersData, error: usersError } = useSWR<{ users: User[] }>(
    token ? ["/api/admin/users", token] : null,
    ([url, token]: [string, string | null]) => fetcher(url, token),
    { refreshInterval: 1000, dedupingInterval: 1000 } // Increased interval for performance
  );

  // Redirect to login if there's an authentication error
  if (
    statsError?.message === "Unauthorized" ||
    usersError?.message === "Unauthorized"
  ) {
    router.push("/admin/login");
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col items-center py-12 bg-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Admin Dashboard
        </h1>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl px-4">
          {!statsData ? (
            <p>Loading statistics...</p>
          ) : statsError ? (
            <div className="alert alert-error">
              <span>{statsError.message || "Failed to fetch statistics."}</span>
            </div>
          ) : (
            <>
              <StatsCard
                title="Total Registrations"
                count={statsData.totalRegistrations || 0}
              />
              <StatsCard title="Total Logins" count={statsData.totalLogins || 0} />
              <StatsCard
                title="Unseen Messages"
                count={statsData.userSentMessagesNotSeen || 0}
              />
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-full max-w-4xl px-4 my-8 border-t border-gray-300"></div>

        {/* Users Management Section */}
        <div className="w-full max-w-4xl px-4">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>

          {!usersData ? (
            <p>Loading users...</p>
          ) : usersError ? (
            <div className="alert alert-error">
              <span>{usersError.message || "Failed to fetch users."}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Registered At</th>
                    <th>Sent Stats Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((user: User) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{new Date(user.createdAt).toLocaleString()}</td>
                      <td
                        className={`${
                          user.sentStatsCount > 0 ? "bg-red-200 text-red-800 font-semibold" : ""
                        } px-4 py-2 rounded`}
                      >
                        {user.sentStatsCount}
                      </td>
                      <td>
                        <Link
                          href={`/admin/chat/${user._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Chat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
