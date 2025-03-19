// components/journey/IndividualJourneysContent.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/journeys/Sidebar";
import { TopNavigation } from "@/components/journeys/TopNavigation";
import { LearningPath } from "@/components/journeys/LearningPath";

// Extended Level type for journey page
interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  defaultCode: string;
  expectedOutput: string;
  solutionCode: string;
  hints: string[] | string;
  order: number;
  journeyId: number;
  xpReward: number;
  testCases: any[] | string;
  languageId?: number;
  status?: "locked" | "completed" | "next" | "available";
  isCompleted?: boolean;
  levelProgress?: any[];
}

// LevelWithProgress type expected by LearningPath component
interface LevelWithProgress {
  id: number;
  title: string;
  description: string;
  order: number;
  journeyId: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  defaultCode: string;
  expectedOutput: string;
  solutionCode: string;
  hints: string[];
  xpReward: number;
  testCases: any[];
  isCompleted?: boolean;
  status?: "locked" | "completed" | "next" | "available";
  levelProgress?: Array<{
    id?: number;
    userId?: number;
    levelId?: number;
    isCompleted: boolean;
    completedAt?: Date;
    lastSubmittedCode?: string;
  }>;
}

interface Journey {
  id: number;
  title: string;
  description: string;
  slug: string;
  icon: string;
  difficultyLevel: string;
  isActive: boolean;
  order: number;
}

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

interface JourneyContentProps {
  user: UserData;
  journeySlug: string;
  initialJourney: Journey | null;
  initialProgress: JourneyProgress | null;
  initialLevels: Level[] | null;
  error: string | null;
}

// Helper function to map difficulty strings to the allowed values
function mapDifficultyToAllowedValues(difficulty: string): "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  const lowerDiff = difficulty.toLowerCase();
  if (lowerDiff.includes("beginner")) return "Beginner";
  if (lowerDiff.includes("intermediate")) return "Intermediate";
  if (lowerDiff.includes("advanced")) return "Advanced";
  if (lowerDiff.includes("expert")) return "Expert";
  return "Beginner"; // Default fallback
}

// Function to convert Level[] to LevelWithProgress[] for LearningPath
function convertToLearningPathLevels(levels: Level[]): LevelWithProgress[] {
  return levels.map(level => ({
    ...level,
    difficulty: mapDifficultyToAllowedValues(level.difficulty),
    // Ensure hints and testCases are the right format if they're strings
    hints: Array.isArray(level.hints) ? level.hints : level.hints ? JSON.parse(level.hints as string) : [],
    testCases: Array.isArray(level.testCases) ? level.testCases : level.testCases ? JSON.parse(level.testCases as string) : [],
  })) as LevelWithProgress[];
}

const IndividualJourneysContent = ({ 
  user,
  journeySlug, 
  initialJourney, 
  initialProgress, 
  initialLevels,
  error 
}: JourneyContentProps) => {
  const router = useRouter();
  
  const [activeNode, setActiveNode] = useState<number | null>(() => {
    if (!initialLevels || initialLevels.length === 0) return null;
    
    if (initialProgress && initialProgress.currentLevelOrder) {
      // Find the level with the current order
      const currentLevel = initialLevels.find(
        level => level.order === initialProgress.currentLevelOrder
      );
      if (currentLevel) {
        return currentLevel.id;
      }
    }
    
    // Default to first level if no progress or level not found
    return initialLevels[0]?.id || null;
  });
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => router.push("/journeys")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Journeys
          </button>
        </div>
      </div>
    );
  }
  
  // If no journey data was found
  if (!initialJourney || !initialLevels || initialLevels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No journey data available</p>
      </div>
    );
  }
  
  // Sidebar width configuration
  const sidebarWidth = "450px"; 

  // Handle node click
  const handleNodeClick = (id: number) => {
    setActiveNode(id);
    router.push(`/journeys/${journeySlug}/${id}`);
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/journeys");
  };

  // Find the active level data
  const activeLevelData = initialLevels.find(level => level.id === activeNode) || initialLevels[0];

  // Get the next level based on current progress
  const nextLevel = initialLevels.find(
    level => initialProgress?.currentLevelOrder && 
    level.order === initialProgress.currentLevelOrder + 1
  );

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!initialLevels.length) return 0;
    if (!initialProgress) return 0;
  
    // Count how many levels the user has fully completed
    const completedLevels = initialLevels.filter(level => level.isCompleted).length;
  
    return Math.round((completedLevels / initialLevels.length) * 100);
  };
  // Convert levels to the format expected by LearningPath
  const learningPathLevels = convertToLearningPathLevels(initialLevels);

  return (
    <div className="flex flex-1 pt-16"> {/* pt-16 adds padding-top to account for the fixed navbar height */}
      {/* Left Sidebar with configurable width */}
      <Sidebar 
        onBack={handleBack} 
        width={sidebarWidth} 
        journeySlug={journeySlug}
      />
  
      {/* Main Content with corresponding margin */}
      <div style={{ marginLeft: sidebarWidth }} className="flex-1">
        {/* Top Navigation */}
        {activeLevelData && (
          <TopNavigation 
            title={activeLevelData.title} 
            subtitle={`Section 1, Chapter ${activeLevelData.order}`}
            onBack={handleBack}
          />
        )}
  
        {/* Learning Path Content */}
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="border-t border-b border-gray-300 py-4 mb-6 text-center">
            <h2 className="text-xl text-gray-600">{initialJourney.title || 'Coding Journey'}</h2>
          </div>
  
          {/* Journey Description and Progress - Moved to top */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{initialJourney.title || 'Your Coding Journey'}</h3>
              <div className="text-sm font-medium text-blue-600">
                {calculateCompletionPercentage()}% Complete
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {initialJourney.description || 
                `This journey guides you through ${journeySlug} from basics to advanced concepts.`}
            </p>
            
            {/* Progress bar - highlighted with stronger colors */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out" 
                style={{ 
                  width: `${calculateCompletionPercentage()}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Level {initialProgress?.currentLevelOrder || 1} of {initialLevels.length}</span>
              <span>
                {initialProgress?.isCompleted 
                  ? "Journey completed!"
                  : `Next: ${nextLevel ? nextLevel.title : "Complete current level"}`}
              </span>
            </div>
          </div>
  
          {/* Learning Path - Pass the converted levels */}
          <LearningPath 
            activeNodeId={activeNode || 1}
            journeySlug={journeySlug}
            onNodeClick={handleNodeClick}
            levels={learningPathLevels}
            journeyProgress={initialProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default IndividualJourneysContent;