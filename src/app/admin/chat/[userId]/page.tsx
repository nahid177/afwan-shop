"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import useSWR, { mutate } from "swr";
import AdminLayout from "../../AdminLayout";
import Image from "next/image";
import { AiOutlineClose } from "react-icons/ai"; // Importing React Icon for Close Button

interface ChatMessage {
  id: string;
  sender: "User" | "Admin";
  userId: string;
  message: string;
  imageUrl?: string;
  status: "sent" | "seen";
  time: string;
}

interface ApiGetMessagesResponse {
  messages: ChatMessage[];
  username: string;
}

const fetcher = (url: string, token: string) => {
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

const AdminChat: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId;
  const token = Cookies.get("token");

  const [input, setInput] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data, error: fetchError } = useSWR<ApiGetMessagesResponse>(
    token && userId ? [`/api/admin/messages/${userId}`, token] : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      refreshInterval: 1000, // Revalidate every 1 second
      dedupingInterval: 1000, // Deduplicate requests within 1 second
    }
  );

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (data?.messages) {
      scrollToBottom();
    }
  }, [data]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (input.trim() === "" && !imageFile) return;
    setSending(true);
    setError("");

    if (!token) {
      router.push("/login");
      return;
    }

    let imageUrl: string | undefined;

    // If an image is selected, upload it first
    if (imageFile) {
      const formData = new FormData();
      formData.append("files", imageFile);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.urls[0]; // Assuming single file upload
        } else {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.message || "Image upload failed.");
        }
      } catch (err: unknown) {
        console.error("Error uploading image:", err);
        if (err instanceof Error) {
          setError(err.message || "Failed to upload image.");
        } else {
          setError("An unexpected error occurred during image upload.");
        }
        setSending(false);
        return;
      }
    }

    const messageData = {
      userId,
      message: input,
      imageUrl, // Include imageUrl if available
    };

    try {
      const res = await fetch("/api/admin/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      if (res.ok) {
        setInput("");
        setImageFile(null);
        mutate([`/api/admin/messages/${userId}`, token]); // Revalidate SWR data
        scrollToBottom();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send message.");
      }
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      if (err instanceof Error) {
        setError("Failed to send message. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key for sending message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !sending &&
      (input.trim() !== "" || imageFile)
    ) {
      handleSendMessage();
    }
  };

  // Redirect to login if there's an authentication error
  useEffect(() => {
    if (fetchError?.message === "Unauthorized") {
      router.push("/login");
    }
  }, [fetchError, router]);

  // If userId is not available yet, render nothing or a loader to prevent mismatches
  if (!userId) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  // Function to open modal with selected image
  const openModal = (src: string) => {
    setModalImageSrc(src);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc("");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-gray-800">
            Chat with User: {data?.username || userId}
          </h1>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {!data && !fetchError && (
            <p className="text-center text-gray-500">Loading messages...</p>
          )}

          {/* Chat Messages */}
          {data?.messages && (
            <div className="flex flex-col space-y-4 overflow-y-auto max-h-[60vh] px-4">
              {data.messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                data.messages.map((msg) => {
                  const isAdmin = msg.sender === "Admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isAdmin ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div className="flex flex-col space-y-1 max-w-xs">
                        {/* Sender and Time */}
                        <div
                          className={`flex items-center space-x-2 ${
                            isAdmin ? "" : "flex-row-reverse"
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-700">
                            {msg.sender === "Admin" ? "Admin" : "You"}
                          </div>
                          <time className="text-xs text-gray-400">
                            {msg.time}
                          </time>
                        </div>
                        {/* Message Bubble */}
                        {msg.message && (
                          <div
                            className={`px-4 py-2 rounded-lg shadow-md text-white break-words ${
                              isAdmin
                                ? "bg-blue-500"
                                : "bg-green-500"
                            }`}
                          >
                            {msg.message}
                          </div>
                        )}
                        {/* Display Image if available */}
                        {msg.imageUrl && (
                          <div className="mt-2">
                            <Image
                              src={encodeURI(msg.imageUrl)} // Encode the URL
                              alt="Uploaded Image"
                              width={200} // Adjust as needed
                              height={200} // Adjust as needed
                              className="max-w-full h-auto rounded-md object-cover cursor-pointer"
                              onClick={() => openModal(msg.imageUrl!)}
                            />
                          </div>
                        )}
                        {/* Status */}
                        <div
                          className={`text-xs text-gray-500 ${
                            isAdmin ? "text-left" : "text-right"
                          }`}
                        >
                          {msg.status === "sent" ? "Sent" : "Seen"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Box, Image Upload, and Send Button */}
          <div className="flex items-center space-x-2">
            {/* Image Upload Input */}
            <label className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 hover:text-gray-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 8.828M3 5h4l3.293 3.293a1 1 0 001.414 0L14 5m0 0l3 3m-3-3v12"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </label>

            {/* Display Selected Image Preview */}
            {imageFile && (
              <div className="relative">
                <Image
                  src={URL.createObjectURL(imageFile)}
                  alt="Selected Image"
                  width={48} // 12 * 4 = 48px
                  height={48} // 12 * 4 = 48px
                  className="object-cover rounded-md cursor-pointer"
                  onClick={() => openModal(URL.createObjectURL(imageFile))}
                />
                <button
                  onClick={() => setImageFile(null)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs flex items-center justify-center"
                  aria-label="Remove selected image"
                >
                  <AiOutlineClose size={12} />
                </button>
              </div>
            )}

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className={`px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                sending ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={sending || (input.trim() === "" && !imageFile)}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* DaisyUI Modal for Full-Screen Image View */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative max-w-4xl">
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle absolute right-2 top-2 bg-red-500 hover:bg-red-600"
              aria-label="Close Image Preview"
            >
              <AiOutlineClose size={16} />
            </button>
            <div className="flex justify-center items-center">
              <Image
                src={modalImageSrc}
                alt="Full-Screen Image"
                width={800} // Adjust as needed
                height={600} // Adjust as needed
                className="rounded-md object-contain"
              />
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminChat;
