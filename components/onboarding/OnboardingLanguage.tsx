// add leaners count

"use client";

import React, { useState } from "react";
import { FaPython, FaJava, FaHtml5, FaQuestion } from "react-icons/fa";

interface OnboardingLanguageProps {
  userId: number;
  onComplete: (language: string) => void;
  isSubmitting: boolean;
}

export default function OnboardingLanguage({
  userId,
  onComplete,
  isSubmitting,
}: OnboardingLanguageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [characterMessage, setCharacterMessage] = useState<string>(
    "What do you wish to learn?"
  );

  // Language-specific responses from the character
  const languageResponses: Record<string, string> = {
    python: "Great choice! Python makes everything feel possible.",
    java: "It's used in everything from Android apps to enterprise systems.",
    html: "Let's build the web - one tag at a time.",
    none: "No worries, I'll find the perfect path for you.",
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setCharacterMessage(languageResponses[language]);
  };

  const handleContinue = () => {
    if (!selectedLanguage || isSubmitting) return;
    onComplete(selectedLanguage);
  };

  // Limited programming languages without learner counts
  const languages = [
    {
      id: "python",
      label: "Python",
      icon: <FaPython className="w-full h-full text-blue-500" />,
    },
    {
      id: "java",
      label: "Java",
      icon: <FaJava className="w-full h-full text-red-500" />,
    },
    {
      id: "html",
      label: "HTML",
      icon: <FaHtml5 className="w-full h-full text-orange-500" />,
    },
    {
      id: "none",
      label: "I have no idea",
      icon: <FaQuestion className="w-full h-full text-gray-500" />,
    },
  ];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {languages.map((language) => (
            <button
              key={language.id}
              className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-start shadow-md ${
                selectedLanguage === language.id
                  ? "border-blue-500 bg-blue-50 shadow-blue-200 translate-y-0"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
              }`}
              onClick={() => handleLanguageSelect(language.id)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex-shrink-0">
                  {language.icon}
                </div>
                <span
                  className={`font-medium ${
                    selectedLanguage === language.id ? "text-blue-700" : ""
                  }`}
                >
                  {language.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedLanguage || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 relative ${
            !selectedLanguage || isSubmitting
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