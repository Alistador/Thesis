"use client";

import React, { useState } from "react";
import { FaClock } from "react-icons/fa";

interface OnboardingCommitmentProps {
  userId: number;
  onComplete: (commitment: string) => void;
  isSubmitting: boolean;
}

export default function OnboardingCommitment({
  userId,
  onComplete,
  isSubmitting,
}: OnboardingCommitmentProps) {
  const [selectedCommitment, setSelectedCommitment] = useState<string | null>(
    null
  );
  const [characterMessage, setCharacterMessage] = useState<string>(
    "How much are you ready to commit?"
  );

  // Commitment-specific responses from the character
  const commitmentResponses: Record<string, string> = {
    "5min": "Step by step, we build greatness. Let’s roll.",
    "15min": "Your daily dose of code fuel.",
    "30min": "Now we’re cooking with code!",
    "60min": "Locked in. Let’s make you a coding legend!",
  };

  // Commitment level options
  const commitmentLevels = [
    {
      id: "5min",
      timeLabel: "5 min per day",
      intensityLabel: "Easygoing",
      icon: <FaClock className="text-blue-400" />,
    },
    {
      id: "15min",
      timeLabel: "15 min per day",
      intensityLabel: "Standard",
      icon: <FaClock className="text-green-500" />,
    },
    {
      id: "30min",
      timeLabel: "30 min per day",
      intensityLabel: "Committed",
      icon: <FaClock className="text-yellow-500" />,
    },
    {
      id: "60min",
      timeLabel: "60 min per day",
      intensityLabel: "Immersive",
      icon: <FaClock className="text-red-500" />,
    },
  ];

  const handleCommitmentSelect = (commitment: string) => {
    setSelectedCommitment(commitment);
    setCharacterMessage(commitmentResponses[commitment]);
  };

  const handleContinue = () => {
    if (!selectedCommitment || isSubmitting) return;
    onComplete(selectedCommitment);
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
        <div className="flex flex-col space-y-4 max-w-xl mx-auto">
          {commitmentLevels.map((level) => (
            <button
              key={level.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 shadow-md ${
                selectedCommitment === level.id
                  ? "border-blue-500 bg-blue-50 shadow-blue-200 translate-y-0"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
              }`}
              onClick={() => handleCommitmentSelect(level.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 flex-shrink-0">{level.icon}</div>
                  <span
                    className={`font-medium ${
                      selectedCommitment === level.id ? "text-blue-700" : ""
                    }`}
                  >
                    {level.timeLabel}
                  </span>
                </div>
                <span className="text-gray-500">{level.intensityLabel}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedCommitment || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 relative ${
            !selectedCommitment || isSubmitting
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
