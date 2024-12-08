// src/app/admin/login/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@/mode/ThemeContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

const Login: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [toast, setToast] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Generate or retrieve deviceId
    const storedDeviceId = localStorage.getItem("deviceId");

    if (!storedDeviceId) {
      const newDeviceId = uuidv4();
      localStorage.setItem("deviceId", newDeviceId);
      setDeviceId(newDeviceId);
      console.log("New deviceId generated:", newDeviceId);
    } else {
      setDeviceId(storedDeviceId);
      console.log("Existing deviceId:", storedDeviceId);
    }

    // Check if the user is already logged in
    const token = Cookies.get("token");
    console.log("Checking token in Login:", token);

    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      username,
      password,
      deviceId,
    };

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.status === 200) {
        setToast({ type: "success", message: "Login successful!" });
        Cookies.set("token", result.token, { expires: 1, path: "/" }); // Store token in cookies
        setLoading(false);
        router.push("/admin");
      } else {
        setToast({ type: "error", message: result.message });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setToast({ type: "error", message: "An error occurred during login." });
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-6 lg:py-12 ${
        theme === "light" ? "bg-base-100 text-black" : "bg-gray-900 text-white"
      }`}
    >
      <div className="flex flex-col md:flex-row-reverse items-center max-w-4xl w-full space-y-6 md:space-y-0 md:space-x-6">
        <div className="text-center md:text-left flex-1 px-6">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Login Now!</h1>
          <p className="text-sm md:text-base lg:text-lg">
            Welcome back! Please login with your admin credentials. Only two devices are allowed per user account.
          </p>
        </div>

        <div
          className={`card w-full max-w-sm md:max-w-lg lg:max-w-md shadow-2xl p-6 ${
            theme === "light" ? "bg-base-100" : "bg-gray-800"
          }`}
        >
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className={`input input-bordered w-full ${
                  theme === "light" ? "" : "bg-gray-700 text-white"
                }`}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className={`input input-bordered w-full ${
                  theme === "light" ? "" : "bg-gray-700 text-white"
                }`}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          {toast.message && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 w-full max-w-xs px-4 sm:px-0 z-50">
              {toast.type === "success" && (
                <div
                  className={`flex items-center w-full p-4 mb-4 text-gray-500 ${
                    theme === "light" ? "bg-white" : "bg-gray-800"
                  } rounded-lg shadow`}
                  role="alert"
                >
                  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm font-normal">
                    {toast.message}
                  </div>
                </div>
              )}

              {toast.type === "error" && (
                <div
                  className={`flex items-center w-full p-4 mb-4 text-gray-500 ${
                    theme === "light" ? "bg-white" : "bg-gray-800"
                  } rounded-lg shadow`}
                  role="alert"
                >
                  <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm font-normal">
                    {toast.message}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-sm">
              Don&#39;t have an account?{" "}
              <Link
                href="/admin/register"
                className="text-blue-500 hover:underline"
              >
                Register here
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
