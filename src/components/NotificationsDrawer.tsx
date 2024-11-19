// src/components/NotificationsDrawer.tsx
"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { Notification } from "@/interfaces/Notification";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data.offerEntries);

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const { data: notifications, error } = useSWR<Notification[]>("/api/offer-entries", fetcher);

  // Calculate unread notifications (assuming isActive represents unread)
  const unreadCount = notifications
    ? notifications.filter((notification) => notification.isActive).length
    : 0;

  const markAsRead = async (id: string) => {
    try {
      await axios.put("/api/offer-entries", { id, isActive: false });
      mutate("/api/offer-entries");
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      {/* Drawer */}
      <div
        id="notifications-drawer"
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Notifications</h2>
          <button onClick={onClose} aria-label="Close Notifications">
            <FiX className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="text-red-500">Failed to load notifications.</div>
          )}
          {!notifications && !error && (
            <div className="text-gray-500">Loading notifications...</div>
          )}
          {notifications && notifications.length === 0 && (
            <div className="text-gray-500">No notifications available.</div>
          )}
          {notifications && notifications.length > 0 && (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`p-4 rounded-lg shadow-sm cursor-pointer ${
                    notification.isActive
                      ? "bg-blue-50 dark:bg-blue-900"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {notification.detail}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Ends at: {new Date(notification.endTime).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsDrawer;
