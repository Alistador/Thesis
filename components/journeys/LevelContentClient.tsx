"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ModularCodeEditor from "@/components/levels/CodeEditor";
import { Lock } from "lucide-react";
import { LevelData } from "@/types/levelTypes";

// Extended Level type with progress information
interface LevelWithProgress extends LevelData {
  order: number;
  journeyId: number;
  isCompleted?: boolean;
  solutionCode?: string; // Added solutionCode field
  levelProgress?: Array<{
    id?: number;
    userId?: number;
    levelId?: number;
    isCompleted: boolean;
    completedAt?: Date;
    lastSubmittedCode?: string;
  }>;
}

// Journey Progress type
interface JourneyProgress {
  userId: number;
  journeyId: number;
  currentLevelOrder: number;
  isCompleted: boolean;
}

interface UserData {
  id: number;
  name: string | null;
  email: string;
}

interface LevelContentClientProps {
  user: UserData;
  journeySlug: string;
  levelId: number;
  level: LevelWithProgress | null;
  journeyProgress: JourneyProgress | null;
  accessDenied: boolean;
  error: string | null;
}

export default function LevelContentClient({
  user,
  journeySlug,
  levelId,
  level,
  journeyProgress,
  accessDenied,
  error
}: LevelContentClientProps) {
  const router = useRouter();
  const [testResult, setTestResult] = useState<"pending" | "success" | "failure" | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(error);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Ref for success notification timeout
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);
  
  // Function to check if a level is completed
  const isLevelCompleted = (level: LevelWithProgress): boolean => {
    // Check for explicit isCompleted flag
    if (level.isCompleted === true) {
      return true;
    }
    
    // Check for completion in level progress
    if (level.levelProgress && 
        level.levelProgress.length > 0 && 
        level.levelProgress[0].isCompleted === true) {
      return true;
    }
    
    // If we get here, the level is not completed
    return false;
  };
  
  // Show success notification with auto-dismiss
  const showSuccessWithTimeout = (duration: number = 5000) => {
    // Clear existing timeout if any
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    
    setShowSuccessNotification(true);
    
    // Set new timeout to hide notification
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccessNotification(false);
    }, duration);
  };
  
  // Function to handle code execution success
  const handleCodeSuccess = async (submittedCode: string) => {
    if (!level) return;
    
    try {
      setTestResult("pending");
      
      // Call the API to mark the level as completed
      const response = await fetch(
        `/api/journeys/${journeySlug}/levels/${levelId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ submittedCode }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to complete level');
      }
      
      await response.json();
      
      // Set success state
      setTestResult("success");
      
      // Show success notification with auto-dismiss
      showSuccessWithTimeout(2000);
      
      // Navigate to the next level after the notification is shown
      successTimeoutRef.current = setTimeout(() => {
        // Navigate to the next level if it exists or back to journey page
        if (journeyProgress && level.order < journeyProgress.currentLevelOrder) {
          const nextLevelId = levelId + 1;
          router.push(`/journeys/${journeySlug}/${nextLevelId}`);
        } else {
          // If no next level, return to journey page
          router.push(`/journeys/${journeySlug}`);
        }
      }, 2000);
    } catch (err) {
      setTestResult("failure");
      setProcessingError(err instanceof Error ? err.message : 'Failed to complete level');
      console.error('Error completing level:', err);
    }
  };
  
  // Show access denied message
  if (accessDenied) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="bg-white border border-yellow-300 rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Lock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Level Locked</h2>
          <p className="text-gray-600 mb-4">
            You need to complete the current level before accessing this one. 
            Redirecting you back to the journey page...
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => router.push(`/journeys/${journeySlug}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Return to Journey
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (processingError) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-red-500 mb-4">{processingError}</p>
          <button 
            onClick={() => router.push(`/journeys/${journeySlug}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Journey
          </button>
        </div>
      </div>
    );
  }
  
  // If level data couldn't be loaded
  if (!level) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <p className="text-gray-500">Level not found</p>
      </div>
    );
  }
  
  // Check if level is already completed
  const isCompleted = isLevelCompleted(level);
  
  // Parse hints and test cases if needed
  const hints = Array.isArray(level.hints) ? level.hints : 
               level.hints ? JSON.parse(level.hints as unknown as string) : [];
  
  const testCases = Array.isArray(level.testCases) ? level.testCases : 
                   level.testCases ? JSON.parse(level.testCases as unknown as string) : [];
  
  // Solutions are available for all levels, but using them means no XP
  const showSolution = level.solutionCode;
  
  return (
    <>
      {/* Success Notification - shown when level is completed */}
      {testResult === "success" && showSuccessNotification && (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center shadow-md transition-opacity duration-300 ease-in-out">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-full p-1 mr-2">
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Level completed! Moving to next level...</span>
          </div>
        </div>
      )}
      
      {/* Already Completed Banner - shown if entering a previously completed level */}
      {isCompleted && testResult !== "success" && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 sticky top-16 z-10">
          <div className="flex items-center">
            <div className="py-1 mr-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p>You've already completed this level! Feel free to practice again or explore other levels.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content with proper spacing for the fixed navbar */}
      <div className="flex flex-1 pt-16"> 
        {/* Main Content takes full width */}
        <div className="flex-1">
          
          {/* Code Editor with level-specific data */}
          <ModularCodeEditor
            defaultCode={level.defaultCode}
            languageId={level.languageId}
            journeySlug={journeySlug} 
            title={level.title}
            description={level.description}
            difficulty={level.difficulty}
            expectedOutput={level.expectedOutput}
            onCodeSuccess={(code) => handleCodeSuccess(code)}
            testResult={testResult}
            setTestResult={setTestResult}
            testCases={testCases}
            hints={hints}
            initialCode={level.levelProgress?.[0]?.lastSubmittedCode || level.defaultCode}
            solutionCode={showSolution ? level.solutionCode : undefined}
          />
        </div>
      </div>
    </>
  );
}