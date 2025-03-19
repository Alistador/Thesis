// components/journey/LearningPath.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { HexButton } from "./HexButton";
import { LevelData, TestCase } from "@/types/levelTypes";

// Extended Level type with the additional properties needed for progress tracking
interface LevelWithProgress extends LevelData {
  order: number;
  journeyId: number;
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

// Journey Progress type
interface JourneyProgress {
  userId: number;
  journeyId: number;
  currentLevelOrder: number;
  isCompleted: boolean;
}

interface LearningPathProps {
  activeNodeId: number;
  journeySlug: string;
  onNodeClick: (id: number) => void;
  levels?: LevelWithProgress[];
  journeyProgress?: JourneyProgress | null;
}

interface NodePosition {
  x: number;
  y: number;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  activeNodeId,
  journeySlug,
  onNodeClick,
  levels = [],
  journeyProgress = null
}) => {
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [loadedLevels, setLoadedLevels] = useState<LevelWithProgress[]>([]);
  const [progress, setProgress] = useState<JourneyProgress | null>(journeyProgress);
  
  const shiftRight = 45; // Base shift amount to move everything right (in pixels)
  
  // Fetch levels if not provided as props
  useEffect(() => {
    async function fetchLevels() {
      if (levels && levels.length > 0) {
        // Use the levels passed from props
        setLoadedLevels(levels);
      } else {
        try {
          const response = await fetch(`/api/journeys/${journeySlug}/levels`);
          if (response.ok) {
            const data = await response.json();
            setLoadedLevels(data);
          } else {
            console.error('Failed to fetch levels');
          }
        } catch (error) {
          console.error('Error fetching levels:', error);
        }
      }
    }
    
    fetchLevels();
  }, [journeySlug, levels]);
  
  // Fetch progress if not provided as props
  useEffect(() => {
    if (journeyProgress) {
      setProgress(journeyProgress);
      return;
    }
    
    async function fetchProgress() {
      try {
        const response = await fetch(`/api/journeys/${journeySlug}/progress`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        } else {
          console.error('Failed to fetch progress');
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    }
    
    fetchProgress();
  }, [journeySlug, journeyProgress]);
  
  // Define the allowed status types to match HexButton's expectations
  type HexStatus = "locked" | "completed" | "next" | "available";
  
  const isLevelCompleted = (level: LevelWithProgress): boolean => {
    // Check for explicit isCompleted flag (use strict equality to true)
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
  
  // Determine node status based on level data and progress
  const getNodeStatus = (level: LevelWithProgress, index: number, sortedLevels: LevelWithProgress[]): HexStatus => {
    // Get the current level order from progress
    const currentLevelOrder = progress?.currentLevelOrder || 1;
    
    // First level should always be "next" if the user is new (no progress)
    if (level.order === 1 && (!progress || progress.currentLevelOrder === 1)) {
        return "next";
    }

    // Check if this level has explicit status
    if (level.status && ["locked", "completed", "next", "available"].includes(level.status)) {
      return level.status as HexStatus;
    }
    
    // Check if level is completed
    if (isLevelCompleted(level)) {
      return "completed";
    }
    
    // The current progression level is "next"
    if (level.order === currentLevelOrder) {
      return "next";
    }
    
    // All other levels are locked
    return "locked";
  };
  
  // Check if a level should be clickable
  const isLevelClickable = (level: LevelWithProgress): boolean => {
    if (!progress)  return level.order === 1;;
    
    // Completed levels are always clickable (for review)
    if (isLevelCompleted(level)) {
      return true;
    }
    
    // Current level is always clickable
    if (level.order === progress.currentLevelOrder) {
      return true;
    }
    
    // All other levels are not clickable
    return false;
  };
  
  // Handler for node click that respects the strict progression
  const handleNodeClick = (id: number) => {
    const level = loadedLevels.find(level => level.id === id);
    if (!level) return;
    
    // We still call onNodeClick regardless of clickable status
    // The popup in HexButton will handle explaining why a level is locked
    onNodeClick(id);
  };
  
  useEffect(() => {
    // Calculate positions based on the actual node positions
    const newPositions = nodeRefs.current.map((ref) =>
      ref ? { 
        x: ref.offsetLeft + ref.clientWidth / 2, 
        y: ref.offsetTop + ref.clientHeight / 2 
      } : { x: 0, y: 0 }
    );
    setPositions(newPositions);
  }, [loadedLevels]);

  // Sort levels by order if they exist
  const sortedLevels = [...loadedLevels].sort((a, b) => a.order - b.order);

  return (
    <div className="relative mb-8" style={{ height: `${sortedLevels.length * 80}px` }}>
      {/* Container with relative positioning */}
      <div className="relative w-full max-w-lg mx-auto h-full">
        {/* Dynamically render path connections */}
        {positions.length > 0 && positions.map((pos, index) => {
          if (index === 0) return null;
          const prevPos = positions[index - 1];
          if (!prevPos) return null;

          const dx = pos.x - prevPos.x;
          const dy = pos.y - prevPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          
          // Get the status of the current level to style the path
          const levelStatus = getNodeStatus(sortedLevels[index], index, sortedLevels);
          
          // Style the path based on the level status
          const pathClass = levelStatus === "locked" 
            ? "absolute border-t-2 border-dashed border-gray-300 opacity-50" 
            : levelStatus === "completed"
              ? "absolute border-t-2 border-blue-500"
              : "absolute border-t-2 border-dashed border-gray-300";

          return (
            <div
              key={`line-${index}`}
              className={pathClass}
              style={{
                top: `${prevPos.y}px`,
                left: `${prevPos.x}px`,
                width: `${distance}px`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: "0 0"
              }}
            ></div>
          );
        })}

        {/* Render nodes with absolute positioning */}
        {sortedLevels.map((level, index) => {
          // Apply zigzag layout
          const isRightColumn = index % 2 !== 0;
          
          // Get status with appropriate fallbacks, ensuring only one active level
          const status = getNodeStatus(level, index, sortedLevels);
          
          // Determine if the level should be clickable
          const clickable = isLevelClickable(level);
          
          return (
            <div
              key={level.id}
              ref={(el) => { nodeRefs.current[index] = el }}
              className="absolute"
              style={{
                top: `${80 * index}px`,
                left: isRightColumn 
                  ? `calc(65% + ${shiftRight}px)` 
                  : `calc(25% + ${shiftRight}px)`,
                transform: "translateX(-50%)"
              }}
            >
              <HexButton 
                id={level.id}
                icon={getLevelIcon(level.order || level.id)}
                label={level.title?.split(" ")[0] || `Level ${level.id}`} // Use first word as label with fallback
                status={status}
                isActive={activeNodeId === level.id}
                journeySlug={journeySlug}
                onClick={handleNodeClick}
                clickable={clickable}
              />
            </div>
          );
        })}
      </div>

      {/* Download button */}
      <div className="absolute bottom-0 right-0">
        <button className="p-2 border border-blue-300 rounded-lg text-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 active:scale-95">
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Helper function to get an icon based on level ID
function getLevelIcon(id: number) {
  // This would be better with actual icons related to each level
  // For now, we'll use a simple text representation
  return (
    <div className="font-bold text-lg">{id}</div>
  );
}