"use client";

import React, { useState, useEffect } from "react";
import OnboardingSource from "@/components/onboarding/OnboardingSource";
import OnboardingLanguage from "@/components/onboarding/OnboardingLanguage";
import OnboardingReason from "@/components/onboarding/OnboardingReason";
import OnboardingExperience from "@/components/onboarding/OnboardingExperience";
import OnboardingCommitment from "@/components/onboarding/OnboardingCommitment";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import AIUserAnalysisPopup from "@/components/onboarding/AIUserAnalysisPopup";
import { useRouter } from "next/navigation";

interface SequentialOnboardingProps {
  userId: number;
  initialProgress: {
    profileCompleted: boolean;
    tutorialCompleted: boolean;
    firstChallengeCompleted: boolean;
  };
}

export default function SequentialOnboarding({
  userId,
  initialProgress,
}: SequentialOnboardingProps) {
  const router = useRouter();
  // Start at step 1 regardless of previous progress
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(initialProgress);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    source: "",
    language: "",
    reason: "",
    experience: "",
    commitment: "",
  });
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);
  // Add a flag to prevent premature navigation
  const [isCompletingFlow, setIsCompletingFlow] = useState(false);

  const totalSteps = 5;

  // Calculate completed steps for progress bar
  const completedSteps = Math.max(currentStep - 1, 0);

  // Step names mapping for database updates
  const stepMapping: Record<number, string> = {
    1: "profile",
    2: "tutorial",
    3: "challenge",
  };

  // Debug function to log the current state
  const debugState = () => {
    console.log("Current step:", currentStep);
    console.log("User preferences:", userPreferences);
    console.log("Progress:", progress);
    console.log("Is completing flow:", isCompletingFlow);
  };

  // Handle completion of a step
  const handleStepComplete = async (step: string, stepData: any) => {
    if (isSubmitting || isCompletingFlow) return; // Prevent multiple submissions

    setIsSubmitting(true);
    console.log(`Updating step ${step} with data:`, stepData);

    try {
      // Update user preferences locally first
      const updatedPreferences = { ...userPreferences };
      updatedPreferences[step as keyof typeof userPreferences] = stepData;
      setUserPreferences(updatedPreferences);

      // Create an array of promises to be executed
      const promises: Promise<Response>[] = [];

      // Add API call for specific preference update
      switch (step) {
        case "source":
          promises.push(saveReferralSource(stepData));
          break;
        case "language":
          promises.push(saveLanguagePreference(stepData));
          break;
        case "reason":
          promises.push(saveCodeReason(stepData));
          break;
        case "experience":
          promises.push(saveExperienceLevel(stepData));
          break;
        case "commitment":
          promises.push(saveCommitmentLevel(stepData));
          break;
      }

      // Only update database progress for the first 3 steps that are in the schema
      if (currentStep <= 3) {
        console.log(`Updating progress for step: ${stepMapping[currentStep]}`);

        promises.push(
          fetch("/api/onboarding/update-progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              step: stepMapping[currentStep],
              completed: true,
            }),
          })
        );
      }

      // Wait for all API calls to complete
      const results = await Promise.all(promises);

      // Check if any request failed
      for (const response of results) {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "API request failed");
        }
      }

      console.log("All API calls completed successfully");

      // Update local progress state for the first 3 steps
      if (currentStep <= 3) {
        const updatedProgress = { ...progress };
        if (currentStep === 1) updatedProgress.profileCompleted = true;
        if (currentStep === 2) updatedProgress.tutorialCompleted = true;
        if (currentStep === 3) updatedProgress.firstChallengeCompleted = true;
        setProgress(updatedProgress);
      }

      // Use setTimeout with a longer delay to ensure state updates have propagated
      setTimeout(() => {
        try {
          if (currentStep < totalSteps) {
            // Move to next step
            const nextStep = currentStep + 1;
            console.log(`Moving to step ${nextStep} of ${totalSteps}`);
            setCurrentStep(nextStep);
          } else if (currentStep === totalSteps) {
            // Final step (commitment) completed, show analysis popup
            console.log("Final step completed, showing AI analysis popup");
            setIsCompletingFlow(true);
            setShowAnalysisPopup(true);
          }

          debugState(); // Log state after update
        } catch (error) {
          console.error("Error during step transition:", error);
        } finally {
          setIsSubmitting(false);
        }
      }, 300); // Increased timeout for more reliable state updates
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("There was a problem saving your progress. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle closing the analysis popup
  const handleCloseAnalysisPopup = () => {
    console.log("Analysis popup closed, redirecting to dashboard");
    setShowAnalysisPopup(false);

    // Add a small delay before redirecting to ensure the popup is fully closed
    setTimeout(() => {
      router.push("/dashboard");
    }, 100);
  };

  // API call functions
  const makeApiCall = (endpoint: string, data: any) => {
    return fetch(`/api/onboarding/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        ...data,
      }),
    });
  };

  const saveReferralSource = (source: string) => {
    return makeApiCall("update-source", { source });
  };

  const saveLanguagePreference = (language: string) => {
    return makeApiCall("update-language", { language });
  };

  const saveCodeReason = (reason: string) => {
    return makeApiCall("update-reason", { reason });
  };

  const saveExperienceLevel = (experience: string) => {
    return makeApiCall("update-experience", { experience });
  };

  const saveCommitmentLevel = (commitment: string) => {
    return makeApiCall("update-commitment", { commitment });
  };

  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingSource
            userId={userId}
            onComplete={(source) => handleStepComplete("source", source)}
            isSubmitting={isSubmitting}
          />
        );
      case 2:
        return (
          <OnboardingLanguage
            userId={userId}
            onComplete={(language) => handleStepComplete("language", language)}
            isSubmitting={isSubmitting}
          />
        );
      case 3:
        return (
          <OnboardingReason
            userId={userId}
            onComplete={(reason) => handleStepComplete("reason", reason)}
            isSubmitting={isSubmitting}
          />
        );
      case 4:
        return (
          <OnboardingExperience
            userId={userId}
            onComplete={(experience) =>
              handleStepComplete("experience", experience)
            }
            isSubmitting={isSubmitting}
          />
        );
      case 5:
        return (
          <OnboardingCommitment
            userId={userId}
            onComplete={(commitment) =>
              handleStepComplete("commitment", commitment)
            }
            isSubmitting={isSubmitting}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Debug output on initial render
  useEffect(() => {
    console.log("SequentialOnboarding initialized, starting at step 1");
    debugState();
  }, []);

  // Debug output when currentStep changes
  useEffect(() => {
    console.log(`Step changed to: ${currentStep} of ${totalSteps}`);
  }, [currentStep]);

  return (
    <div>
      <OnboardingProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
      />

      <div className="mt-6">{renderCurrentStep()}</div>

      {/* AI Analysis Popup */}
      {showAnalysisPopup && (
        <AIUserAnalysisPopup
          userPreferences={userPreferences}
          onClose={handleCloseAnalysisPopup}
        />
      )}
    </div>
  );
}
