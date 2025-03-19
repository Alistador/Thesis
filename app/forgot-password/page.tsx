"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/userContext";

export default function ForgotPassword() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useUser();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    if (!email) {
      setError("Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#3B92F4] to-[#3A91F4]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Reset Password
        </h1>
        <p className="text-gray-600 text-center">
          Enter your email address to receive password reset instructions
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              placeholder="Enter your email..."
            />
          </div>

          {error && (
            <p className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm text-center border border-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm text-center border border-green-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md transition-transform transform hover:scale-105 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
          >
            <span className="mr-1">←</span> Return to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
