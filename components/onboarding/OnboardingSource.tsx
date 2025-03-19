"use client";

import React, { useState } from "react";
import {
  FaUsers,
  FaSearch,
  FaGraduationCap,
  FaEllipsisH,
} from "react-icons/fa";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

interface OnboardingSourceProps {
  userId: number;
  onComplete: (source: string) => void;
  isSubmitting: boolean;
}

export default function OnboardingSource({
  userId,
  onComplete,
  isSubmitting,
}: OnboardingSourceProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const sources = [
    {
      id: "friends",
      label: "Friends/Family",
      icon: <FaUsers className="mr-2 text-blue-600" />,
    },
    {
      id: "tiktok",
      label: "TikTok",
      icon: <FaTiktok className="mr-2 text-pink-600" />,
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: <FaInstagram className="mr-2 text-purple-600" />,
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: <FaYoutube className="mr-2 text-red-600" />,
    },
    {
      id: "google",
      label: "Google Search",
      icon: <FaSearch className="mr-2 text-green-600" />,
    },
    {
      id: "school",
      label: "School/University",
      icon: <FaGraduationCap className="mr-2 text-yellow-600" />,
    },
    {
      id: "other",
      label: "Other",
      icon: <FaEllipsisH className="mr-2 text-gray-600" />,
    },
  ];

  const handleSourceSelect = (source: string) => {
    setSelectedSource(source);
  };

  const handleContinue = () => {
    if (!selectedSource || isSubmitting) return;
    onComplete(selectedSource);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 relative">
      {/* Character with speech bubble in top left */}
      <div className="flex items-start mb-12">
        <div className="relative w-24 h-24 flex-shrink-0">
          <img
            src="/character_1.svg"
            alt="Tinkerithm Character"
            className="object-contain w-full h-full"
          />
        </div>

        {/* Speech bubble with tail pointing to character */}
        <div className="relative ml-2 mt-2 bg-blue-100 p-4 rounded-lg max-w-md">
          {/* Triangle pointer for speech bubble */}
          <div className="absolute left-0 top-3 transform -translate-x-2 rotate-45 w-4 h-4 bg-blue-100"></div>
          <p className="text-blue-800 relative z-10">
            Hey there! How did you hear about Tinkerithm?
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {sources.map((source) => (
            <button
              key={source.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 shadow-md flex items-center justify-start ${
                selectedSource === source.id
                  ? "border-blue-500 bg-blue-50 shadow-blue-200 translate-y-0"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
              }`}
              onClick={() => handleSourceSelect(source.id)}
            >
              {source.icon}
              <span
                className={selectedSource === source.id ? "text-blue-700" : ""}
              >
                {source.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedSource || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 relative ${
            !selectedSource || isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-500 border-b-4 border-blue-700 hover:border-blue-600 transform hover:-translate-y-1 active:translate-y-0 active:border-b-2"
          }`}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
