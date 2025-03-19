"use client";

import React, { useState } from "react";
import { FaBaby, FaSyncAlt, FaLaptopCode, FaStar } from "react-icons/fa";

interface OnboardingExperienceProps {
  userId: number;
  onComplete: (experience: string) => void;
  isSubmitting: boolean;
}

export default function OnboardingExperience({
  userId,
  onComplete,
  isSubmitting,
}: OnboardingExperienceProps) {
  const [selectedExperience, setSelectedExperience] = useState<string | null>(
    null
  );
  const [characterMessage, setCharacterMessage] = useState<string>(
    "What is your level of coding experience?"
  );

  // Experience-specific responses from the character
  const experienceResponses: Record<string, string> = {
    beginner: "Every pro was once a beginner—let’s set you up for success.",
    refresher:
      "I'll help you dust off those skills and get you back up to speed.",
    confident: "Solid skills. Time to take them further.",
    expert: "Pro mode activated. Let's take it to the max",
  };

  // Experience level options with react-icons
  const experienceLevels = [
    {
      id: "beginner",
      label: "Complete beginner",
      icon: <FaBaby className="w-full h-full text-blue-500" />,
      description: "I've never written code before",
    },
    {
      id: "refresher",
      label: "Some experience, but need a refresher",
      icon: <FaSyncAlt className="w-full h-full text-green-500" />,
      description: "I've coded before but I'm rusty",
    },
    {
      id: "confident",
      label: "Confident in my coding skills",
      icon: <FaLaptopCode className="w-full h-full text-yellow-500" />,
      description: "I can build simple projects on my own",
    },
    {
      id: "expert",
      label: "Expert at coding",
      icon: <FaStar className="w-full h-full text-purple-500" />,
      description: "I'm proficient in multiple languages",
    },
  ];

  const handleExperienceSelect = (experience: string) => {
    setSelectedExperience(experience);
    setCharacterMessage(experienceResponses[experience]);
  };

  const handleContinue = () => {
    if (!selectedExperience || isSubmitting) return;
    onComplete(selectedExperience);
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
          {experienceLevels.map((level) => (
            <button
              key={level.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 shadow-md flex items-center ${
                selectedExperience === level.id
                  ? "border-blue-500 bg-blue-50 shadow-blue-200 translate-y-0"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
              }`}
              onClick={() => handleExperienceSelect(level.id)}
            >
              <div className="w-8 h-8 mr-3 flex-shrink-0">{level.icon}</div>
              <div className="text-left">
                <span
                  className={`font-medium ${
                    selectedExperience === level.id ? "text-blue-700" : ""
                  }`}
                >
                  {level.label}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {level.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedExperience || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 relative ${
            !selectedExperience || isSubmitting
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
