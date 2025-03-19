import React from "react";

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completedSteps?: number;
}

export default function OnboardingProgressBar({
  currentStep,
  totalSteps = 5,
  completedSteps,
}: OnboardingProgressBarProps) {
  // Calculate progress percentage based on current step
  // This ensures the bar fills proportionally at each step
  const progressPercentage = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-600">
          {Math.max(currentStep - 1, 0)} completed
        </span>
      </div>

      <div className="w-full h-2 bg-cyan-100 rounded-full">
        <div
          className="h-2 bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
