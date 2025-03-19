// contexts/ProgressContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserProgress {
  completedLevels: number[];
  currentLevel: number;
}

interface ProgressContextType {
  userProgress: UserProgress;
  completeLevel: (levelId: number) => void;
  setCurrentLevel: (levelId: number) => void;
  isLevelCompleted: (levelId: number) => boolean;
  isLevelUnlocked: (levelId: number) => boolean;
}

const defaultProgress: UserProgress = {
  completedLevels: [1], // Level 1 is completed by default
  currentLevel: 2     // User starts at level 2
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  // Initialize with default or load from localStorage
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('userProgress');
      return savedProgress ? JSON.parse(savedProgress) : defaultProgress;
    }
    return defaultProgress;
  });

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }
  }, [userProgress]);

  const completeLevel = (levelId: number) => {
    setUserProgress(prev => {
      // Only add to completed levels if not already included
      if (!prev.completedLevels.includes(levelId)) {
        return {
          ...prev,
          completedLevels: [...prev.completedLevels, levelId]
        };
      }
      return prev;
    });
  };

  const setCurrentLevel = (levelId: number) => {
    setUserProgress(prev => ({
      ...prev,
      currentLevel: levelId
    }));
  };

  const isLevelCompleted = (levelId: number) => {
    return userProgress.completedLevels.includes(levelId);
  };

  const isLevelUnlocked = (levelId: number) => {
    // A level is unlocked if:
    // 1. It's level 1 (always unlocked)
    // 2. The previous level is completed
    // 3. It's the current level or already completed
    if (levelId === 1) return true;
    if (isLevelCompleted(levelId)) return true;
    if (levelId === userProgress.currentLevel) return true;
    return isLevelCompleted(levelId - 1);
  };

  return (
    <ProgressContext.Provider
      value={{
        userProgress,
        completeLevel,
        setCurrentLevel,
        isLevelCompleted,
        isLevelUnlocked
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

// Custom hook to use the progress context
export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

