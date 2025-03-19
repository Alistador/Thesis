"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ShieldCheck, Trophy, Gift } from "lucide-react";
import { FaPython, FaJava, FaHtml5, FaCode } from "react-icons/fa";
import { Card } from "@/components/journeys/card";

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

interface SidebarProps {
  onBack: () => void;
  width?: string; // Optional width prop
  journeySlug?: string; // Add journey slug to fetch journey data
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onBack, 
  width = "25%",
  journeySlug 
}) => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJourneyData() {
      if (!journeySlug) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/journeys/${journeySlug}`);
        if (response.ok) {
          const data = await response.json();
          setJourney(data);
        }
      } catch (error) {
        console.error("Error fetching journey data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJourneyData();
  }, [journeySlug]);

  // Get the appropriate icon based on the journey slug or icon field
  const getJourneyIcon = () => {
    if (!journeySlug && !journey) return <FaCode className="w-7 h-7 text-blue-700" />;
    
    const iconType = journey?.icon || journeySlug || '';
    
    switch (iconType.toLowerCase()) {
      case 'python':
        return <FaPython className="w-7 h-7 text-blue-700" />;
      case 'java':
        return <FaJava className="w-7 h-7 text-orange-700" />;
      case 'html':
        return <FaHtml5 className="w-7 h-7 text-red-700" />;
      default:
        return <FaCode className="w-7 h-7 text-blue-700" />;
    }
  };

  // Get journey title
  const getJourneyTitle = () => {
    if (journey?.title) return journey.title;
    
    if (journeySlug) {
      const capitalizedSlug = journeySlug.charAt(0).toUpperCase() + journeySlug.slice(1);
      return `${capitalizedSlug} Journey`;
    }
    
    return "Coding Journey";
  };

  return (
    <div 
      className="bg-white shadow-md fixed top-16 bottom-0 left-0 overflow-y-auto"
      style={{ width }}
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Change Journey */}
        <div className="mb-2">
          <button 
            onClick={() => window.location.href = '/journeys'}
            className="text-blue-500 flex items-center gap-2 text-sm mb-4 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Change journey
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded">
              {getJourneyIcon()}
            </div>
            <h2 className="text-xl font-semibold">{getJourneyTitle()}</h2>
          </div>
          {journey?.description && (
            <p className="text-sm text-gray-600 mt-2">{journey.description}</p>
          )}
        </div>

        {/* Starter League - Made smaller */}
        <Card className="p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Starter League</h3>
            <span className="text-blue-500 text-xs font-medium cursor-pointer hover:underline transition-all">
              VIEW LEAGUE
            </span>
          </div>
          <div className="bg-green-50 rounded-md p-2 flex items-start gap-2">
            <div className="bg-green-200 rounded-md h-8 w-8 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="text-green-700 h-5 w-5" />
            </div>
            <p className="text-xs">
              Start learning and earning XP to join this week's leaderboard!
            </p>
          </div>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Weekly Goals</h3>
            </div>
            <div className="flex gap-2">
              <Gift className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              <button className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors">⋮</button>
            </div>
          </div>
          <div className="text-yellow-500 text-xs mb-4">Week 10</div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Complete 10 lessons</span>
                <span className="text-gray-400">0/10</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-0"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Solve 3 challenges on the first try</span>
                <span className="text-gray-400">0/3</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-0"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Visit Tinkerithm Store</span>
                <span className="text-gray-400">Not done</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-0"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};