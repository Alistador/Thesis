"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface UsernamePopupProps {
  userId: number;
  currentEmail: string;
  onSuccess?: (username: string) => void;
}

export default function UsernamePopup({
  userId,
  currentEmail,
  onSuccess,
}: UsernamePopupProps) {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/user/update-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          username: username.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update username");
      }

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(username.trim());
      }

      // Refresh the page to reflect changes
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 flex-shrink-0 mr-4">
            <img
              src="/character_1.svg"
              alt="Tinkerithm Character"
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              What should we call you?
            </h2>
            <p className="text-gray-600 mt-1">
              Choose a username to personalize your learning experience
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Currently using: {currentEmail}
          </p>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className={`px-4 py-2 rounded-md font-medium ${
                isSubmitting || !username.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Username"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
