// src/components/ChatComponent.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import useSWR, { mutate } from "swr";
import Image from "next/image";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { TiUploadOutline } from "react-icons/ti";
import { useRouter } from "next/navigation";

interface ChatMessage {
  id: string;
  sender: "User" | "Admin";
  senderName?: string;
  userId: string;
  message: string;
  imageUrl?: string;
  status: "sent" | "seen";
  time: string;
}

// Fetcher function that includes the Authorization header
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

const ChatComponent: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Retrieve user information from localStorage
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("You");
  const [token, setToken] = useState<string | null>(null);

  // Initialize router
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      const storedUsername = localStorage.getItem("username") || "You";
      const storedToken = localStorage.getItem("token");
      setUserId(storedUserId);
      setUsername(storedUsername);
      setToken(storedToken);
    }
  }, []);

  // Use SWR to fetch messages with a revalidation interval of 1 second
  const { data: messages, error: fetchError } = useSWR<ChatMessage[]>(
    userId && token ? [`/api/messages?userId=${userId}`, token] : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      refreshInterval: 1000, // Revalidate every 1 second
      dedupingInterval: 1000, // Deduplicate requests within 1 second
      onError: (err: unknown) => {
        console.error("Error fetching messages:", err);
        // Redirect to the "Network Problem" page regardless of error type
        router.push('/yournetworkproblem');
      },
    }
  );

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handle image selection and create object URL
  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  // Send a new message to the API
  const handleSendMessage = async () => {
    if (input.trim() === "" && !imageFile) return;
    setLoading(true);
    setError("");

    if (!userId || !token) {
      setError("User not logged in.");
      setLoading(false);
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
        setLoading(false);
        return;
      }
    }

    const newMessage: Omit<ChatMessage, "id" | "time"> = {
      sender: "User",
      senderName: username,
      userId: userId!,
      message: input,
      imageUrl, // Include imageUrl if available
      status: "sent",
    };

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        const savedMessage = await response.json();

        // Optimistically update the messages cache
        mutate(
          [`/api/messages?userId=${userId}`, token],
          (currentData: ChatMessage[] = []) => [
            ...currentData,
            {
              id: savedMessage.id,
              sender: savedMessage.sender,
              senderName: savedMessage.senderName,
              userId: savedMessage.userId,
              message: savedMessage.message,
              imageUrl: savedMessage.imageUrl, // Include imageUrl
              status: savedMessage.status,
              time: new Date(savedMessage.createdAt).toLocaleString(),
            },
          ],
          false // Do not revalidate after mutation
        );

        setInput("");
        setImageFile(null);
        setImagePreviewUrl(null);
        scrollToBottom();
      } else {
        console.error("Failed to send message");
        const errorData = await response.json();
        setError(
          errorData.message || "Failed to send message. Please try again."
        );
      }
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to send message.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="max-w-full sm:max-w-4xl mx-auto p-4 sm:p-6 space-y-6 bg-white rounded-lg shadow-md mt-16">
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error || "Failed to load messages."}
        </div>
      </div>
    );
  }

  return (
    <PhotoProvider>
      <div className="max-w-full sm:max-w-4xl mx-auto p-4 sm:p-6 space-y-6 bg-white rounded-lg shadow-md mt-16">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex flex-col space-y-4 overflow-y-auto max-h-80 sm:max-h-96 lg:max-h-[500px] px-2 sm:px-4">
          {(!messages || messages.length === 0) && !error && (
            <div className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          )}
          {messages &&
            messages.map((chat) => {
              const isUser = chat.sender === "User";
              return (
                <div
                  key={chat.id}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col space-y-1 max-w-xs sm:max-w-md ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Sender and Time */}
                    <div
                      className={`flex items-center space-x-2 ${
                        isUser ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="text-sm sm:text-base font-medium text-gray-700">
                        {isUser ? "You" : "Admin"}
                      </div>
                      <time className="text-xs sm:text-sm text-gray-400">
                        {chat.time}
                      </time>
                    </div>
                    {/* Message Bubble */}
                    {chat.message && (
                      <div
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-md text-white break-words ${
                          isUser ? "bg-green-500" : "bg-blue-500"
                        }`}
                      >
                        {chat.message}
                      </div>
                    )}
                    {/* Display Image if available */}
                    {chat.imageUrl && (
                      <div className="mt-2">
                        <PhotoView src={chat.imageUrl}>
                          <Image
                            src={chat.imageUrl}
                            alt="Uploaded Image"
                            width={200} // Adjust as needed
                            height={200} // Adjust as needed
                            className="rounded-md object-cover cursor-pointer transition-transform transform hover:scale-105 w-full h-auto max-w-xs sm:max-w-sm lg:max-w-md"
                            loading="lazy" // Enable lazy loading
                          />
                        </PhotoView>
                      </div>
                    )}
                    {/* Status */}
                    <div
                      className={`text-xs sm:text-sm text-gray-500 ${
                        isUser ? "text-right" : "text-left"
                      }`}
                    >
                      {chat.status === "sent" ? "Sent" : "Seen"}
                    </div>
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box, Image Upload, and Send Button */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Image Upload Input */}
          <label className="cursor-pointer flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
            <TiUploadOutline className="h-6 w-6 text-gray-600 sm:h-7 sm:w-7" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                  handleImageSelect(e.target.files[0]);
                }
              }}
            />
          </label>

          {/* Display Selected Image Preview */}
          {imageFile && imagePreviewUrl && (
            <div className="relative flex-shrink-0">
              <PhotoView src={imagePreviewUrl}>
                <Image
                  src={imagePreviewUrl}
                  alt="Selected Image"
                  width={48} // 12 * 4 = 48px (h-12)
                  height={48} // 12 * 4 = 48px (w-12)
                  className="object-cover rounded-md cursor-pointer transition-transform transform hover:scale-105"
                  loading="lazy"
                />
              </PhotoView>
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreviewUrl(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs sm:p-1.5 sm:text-sm"
                aria-label="Remove Image"
              >
                &times;
              </button>
            </div>
          )}

          {/* Text Input and Send Button */}
          <div className="flex-1 flex items-center space-x-2 sm:space-x-4">
            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !loading &&
                  (input.trim() !== "" || imageFile)
                ) {
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-14 flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              className={`px-4 sm:px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 flex-shrink-0 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading || (input.trim() === "" && !imageFile)}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </PhotoProvider>
  );
};

export default ChatComponent;
