"use client";

import React, { useState } from "react";
import {
  FaCode,
  FaBrain,
  FaBriefcase,
  FaGamepad,
  FaGraduationCap,
  FaLaptopCode,
  FaPalette,
  FaEllipsisH,
} from "react-icons/fa";

interface OnboardingReasonProps {
  userId: number;
  onComplete: (reason: string) => void;
  isSubmitting: boolean;
}

export default function OnboardingReason({
  userId,
  onComplete,
  isSubmitting,
}: OnboardingReasonProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [characterMessage, setCharacterMessage] = useState<string>(
    "Why are you learning to code?"
  );

  // Reason-specific responses from the character
  const reasonResponses: Record<string, string> = {
    explore: "Welcome to the code side!",
    challenge: "Brain, meet your toughest opponent: code.",
    career: "Smart move! Let's build your future.",
    fun: "Fun? You'll be addicted in no time.",
    education: "Learning just got a lot more interesting.",
    apps: "From idea to reality - let's build.",
    creative:
      "Coding is like having digital paintbrushes and an infinite canvas!",
    other: "You do you!",
  };

  // Learning reasons options
  const reasons = [
    {
      id: "explore",
      label: "Explore what is coding",
      icon: <FaCode className="w-full h-full text-indigo-500" />,
    },
    {
      id: "challenge",
      label: "Challenge my brain",
      icon: <FaBrain className="w-full h-full text-pink-400" />,
    },
    {
      id: "career",
      label: "Boost my career",
      icon: <FaBriefcase className="w-full h-full text-yellow-600" />,
    },
    {
      id: "fun",
      label: "Just for fun",
      icon: <FaGamepad className="w-full h-full text-gray-700" />,
    },
    {
      id: "education",
      label: "Support my education",
      icon: <FaGraduationCap className="w-full h-full text-indigo-400" />,
    },
    {
      id: "apps",
      label: "Build my own apps",
      icon: <FaLaptopCode className="w-full h-full text-blue-400" />,
    },
    {
      id: "creative",
      label: "Expand creative skills",
      icon: <FaPalette className="w-full h-full text-purple-500" />,
    },
    {
      id: "other",
      label: "Other",
      icon: <FaEllipsisH className="w-full h-full text-gray-600" />,
    },
  ];

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setCharacterMessage(reasonResponses[reason]);
  };

  const handleContinue = () => {
    if (!selectedReason || isSubmitting) return;
    onComplete(selectedReason);
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
        <div className="relative ml-2 mt-2 bg-blue-100 p-4 rounded-lg max-w-md transition-all duration-300 ease-in-out">
          {/* Triangle pointer for speech bubble */}
          <div className="absolute left-0 top-3 transform -translate-x-2 rotate-45 w-4 h-4 bg-blue-100"></div>
          <p className="text-blue-800 relative z-10 transition-opacity duration-300">
            {characterMessage}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {reasons.map((reason) => (
            <button
              key={reason.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-start shadow-md ${
                selectedReason === reason.id
                  ? "border-blue-500 bg-blue-50 shadow-blue-200 translate-y-0"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
              }`}
              onClick={() => handleReasonSelect(reason.id)}
            >
              <div className="w-8 h-8 mr-3 flex-shrink-0">{reason.icon}</div>
              <span
                className={`font-medium ${
                  selectedReason === reason.id ? "text-blue-700" : ""
                }`}
              >
                {reason.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedReason || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 relative ${
            !selectedReason || isSubmitting
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
