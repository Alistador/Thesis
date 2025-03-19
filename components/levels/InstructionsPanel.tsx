"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, CheckCircle, XCircle } from "lucide-react";

interface InstructionsPanelProps {
  title: string;
  description: string;
  difficulty: string;
  width: number;
  hints?: string[];
  testResult?: "pending" | "success" | "failure" | null;
  solutionCode?: string;
}

export default function InstructionsPanel({
  title = "The Language",
  description = "Python is one of the world's easiest and most popular programming languages.",
  difficulty = "Beginner",
  width,
  hints = [],
  testResult = null,
  solutionCode,
}: InstructionsPanelProps) {
  const [hintsExpanded, setHintsExpanded] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  
  const handleViewSolution = () => {
    if (!solutionVisible) {
      setShowSolutionModal(true);
    } else {
      setSolutionVisible(false);
    }
  };

  const handleRevealSolution = () => {
    setShowSolutionModal(false);
    setSolutionVisible(true);
  };

  const handleCancelReveal = () => {
    setShowSolutionModal(false);
  };
  
  return (
    <div
      className="p-6 overflow-y-auto border-r border-gray-200 bg-white"
      style={{ width: `${width}%` }}
    >
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="mb-6 text-gray-700">{description}</p>

      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            <span className="text-lg">💡</span>
          </div>
          <h3 className="text-lg font-semibold">Challenge</h3>
          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
            {difficulty}
          </span>
        </div>
        <p className="ml-7 text-gray-700">
          Press the run code button to run your code. The output should match the expected result.
        </p>
      </div>

      {/* Test Results Section - Shown when there's a test result */}
      {testResult && (
        <div className={`mb-6 p-3 rounded-lg ${
          testResult === "success" ? "bg-green-50" : 
          testResult === "failure" ? "bg-red-50" : "bg-gray-50"
        }`}>
          <div className="flex items-center">
            {testResult === "success" && (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            )}
            {testResult === "failure" && (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <h3 className={`font-semibold ${
              testResult === "success" ? "text-green-700" : 
              testResult === "failure" ? "text-red-700" : "text-gray-700"
            }`}>
              {testResult === "success" ? "Success!" : 
               testResult === "failure" ? "Not quite right" : "Testing..."}
            </h3>
          </div>
          <p className={`mt-1 text-sm ${
            testResult === "success" ? "text-green-600" : 
            testResult === "failure" ? "text-red-600" : "text-gray-600"
          }`}>
            {testResult === "success" 
              ? "Your code passed all test cases. Great job!" 
              : "Your code doesn't match the expected output. Try again!"}
          </p>
        </div>
      )}

      {/* Hints Section */}
      {hints.length > 0 && (
        <div className="mb-6">
          <button 
            className="flex items-center w-full text-left" 
            onClick={() => setHintsExpanded(!hintsExpanded)}
          >
            <div className="w-5 h-5 mr-2 flex items-center justify-center">
              <span className="text-lg">🔍</span>
            </div>
            <h3 className="text-lg font-semibold">Hints</h3>
            {hintsExpanded ? (
              <ChevronDown className="w-4 h-4 ml-2" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </button>
          {hintsExpanded && (
            <div className="mt-2 ml-7 text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                {hints.map((hint, index) => (
                  <li key={index} className="text-sm">{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Solution Section */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            <span className="text-lg">🎯</span>
          </div>
          <h3 className="text-lg font-semibold">Solution</h3>
          <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
            -1
          </span>
        </div>
        {solutionCode ? (
          <div>
            <button 
              className="ml-7 px-3 py-1 text-sm rounded-md border border-gray-300 flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={handleViewSolution}
            >
              <span>{solutionVisible ? "Hide" : "Solution"}</span>
              {solutionVisible ? (
                <ChevronDown className="w-3 h-3 ml-1" />
              ) : (
                <ChevronRight className="w-3 h-3 ml-1" />
              )}
            </button>
            
            {solutionVisible && (
              <div className="ml-7 mt-2 p-3 bg-gray-50 rounded-md">
                <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap overflow-x-auto">
                  {solutionCode}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="ml-7 text-gray-500 text-sm italic">
            Solution will be available after you complete this level or if you need extra help.
          </div>
        )}
      </div>
      
      {/* XP Information */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 mr-2 flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <h3 className="text-base font-semibold text-blue-800">Reward</h3>
        </div>
        <p className="text-sm text-blue-700 ml-7">
          Complete this level to earn XP and unlock the next level!
        </p>
      </div>

      {/* Solution Modal */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Reveal Solution</h2>
            <p className="text-center mb-6">
              After revealing the solution, you won't achieve a score on completion of the challenge.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelReveal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRevealSolution}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Reveal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}