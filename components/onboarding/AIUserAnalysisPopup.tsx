"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface AIUserAnalysisPopupProps {
  userPreferences: {
    source: string;
    language: string;
    reason: string;
    experience: string;
    commitment: string;
  };
  onClose: () => void;
}

interface Analysis {
  title: string;
  summary: string;
  recommendations: string[];
}

export default function AIUserAnalysisPopup({
  userPreferences,
  onClose,
}: AIUserAnalysisPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Show animation when component mounts and disable body scrolling
  useEffect(() => {
    // Disable scrolling on body when popup opens
    document.body.style.overflow = "hidden";

    setIsVisible(true);
    fetchAnalysis();

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);

    // Delay actual closing to allow animation to complete
    setTimeout(() => {
      // Re-enable scrolling when popup is fully closed
      document.body.style.overflow = "auto";
      onClose();
    }, 300);
  };

  // Get a fallback analysis in case the API call fails
  const getFallbackAnalysis = (): Analysis => {
    return {
      title: "Welcome to Tinkerithm!",
      summary:
        "We're excited to have you join our coding community. We'll help you achieve your coding goals based on your preferences.",
      recommendations: [
        "Explore our tutorials tailored to your experience level",
        "Join our community forum to connect with other learners",
        "Check out projects aligned with your interests",
      ],
    };
  };

  // Fetch analysis from AI API
  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze-user-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: userPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Error fetching AI analysis:", err);
      setError("We couldn't generate a personalized analysis at this time.");
      // Use fallback analysis
      setAnalysis(getFallbackAnalysis());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-500/30 backdrop-blur-[2px] flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 max-w-xl w-full mx-4 transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-24 h-24 mb-4">
              <img
                src="/character_1.svg"
                alt="Robby Character"
                className="object-contain w-full h-full"
              />
            </div>
            <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-center">
              <span className="font-medium">Robby</span> is analyzing your
              preferences...
            </p>
          </div>
        ) : (
          <>
            {/* Header with light bulb icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M12 21v-1"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {analysis?.title}
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            )}

            {/* Personalized analysis summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Robby's Analysis
              </h3>
              <p className="text-gray-600">{analysis?.summary}</p>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Robby recommends
              </h3>
              <ul className="space-y-2">
                {analysis?.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">
                        {index + 1}
                      </span>
                    </span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Explore
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-500 font-medium"
              >
                Start Journey
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
