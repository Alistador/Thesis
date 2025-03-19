"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

interface TopNavigationProps {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  levelId?: number;
  journeySlug?: string;
}

interface Level {
  id: number;
  title: string;
  order: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ 
  title, 
  subtitle, 
  onBack,
  levelId,
  journeySlug
}) => {
  const [levelData, setLevelData] = useState<Level | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch level data if not provided directly
  useEffect(() => {
    async function fetchLevelData() {
      if (title || !levelId || !journeySlug) {
        // If title is already provided or we don't have enough info to fetch, skip
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/journeys/${journeySlug}/levels/${levelId}`);
        if (response.ok) {
          const data = await response.json();
          setLevelData(data);
        }
      } catch (error) {
        console.error("Error fetching level data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLevelData();
  }, [title, levelId, journeySlug]);

  // Determine what to display
  const displayTitle = title || levelData?.title || (loading ? "Loading..." : "Level");
  const displaySubtitle = subtitle || (levelData ? `Section 1, Chapter ${levelData.order}` : "");

  return (
    <div className="bg-blue-400 text-white p-4 shadow-md sticky top-16 z-10">
      <div className="flex items-center">
        <button 
          onClick={onBack} 
          className="mr-3 hover:bg-blue-500 p-1 rounded transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="text-sm">{displaySubtitle}</div>
          <div className="text-xl font-medium">{displayTitle}</div>
        </div>
      </div>
    </div>
  );
};