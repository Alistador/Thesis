"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { IconType } from "react-icons";
import { 
  FaPython, 
  FaHtml5, 
  FaJava, 
  FaCode, 
  FaJs, 
  FaReact, 
  FaDatabase, 
  FaServer, 
  FaMobile,
  FaTerminal,
  FaRobot
} from "react-icons/fa";
import { SiTypescript, SiCplusplus, SiRuby, SiSwift, SiKotlin } from "react-icons/si";

// Map of available icons
const iconComponents: Record<string, IconType> = {
  python: FaPython,
  html: FaHtml5,
  java: FaJava,
  javascript: FaJs,
  typescript: SiTypescript,
  cpp: SiCplusplus,
  ruby: SiRuby,
  swift: SiSwift,
  kotlin: SiKotlin,
  react: FaReact,
  database: FaDatabase,
  backend: FaServer,
  mobile: FaMobile,
  cli: FaTerminal,
  ai: FaRobot,
  default: FaCode
};

// Types
type Journey = {
  id: string;
  name: string;
  description?: string;
  coders: number;
  completionPercentage?: number;
  isEnrolled?: boolean;
  difficulty?: string;
  iconName?: string;
  iconColor: string;
  bgColor: string;
};

type JourneysContentProps = {
  journeys: Journey[];
  displayName: string;
};

const JourneyContent = ({ journeys, displayName }: JourneysContentProps) => {
  return (
    <div className="flex-1 pt-20 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page title and welcome message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Coding Journeys
        </h1>
        <p className="text-gray-600 mb-10 text-center">
          Welcome back, {displayName}! Continue your learning adventure.
        </p>

        {/* Journey cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {journeys.map((journey) => {
            // Get the icon component dynamically
            const IconComponent = iconComponents[journey.iconName || "default"];

            return (
              <Link href={`/journeys/${journey.id}`} key={journey.id} className="block">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 h-full transition-all duration-200 hover:shadow-md hover:translate-y-[-3px] relative">
                  {/* Enrolled badge */}
                  {journey.isEnrolled && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-purple-500 rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Language logo */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-24 h-24 ${journey.bgColor} rounded-full flex items-center justify-center`}>
                      {IconComponent && <IconComponent size={56} color={journey.iconColor} />}
                    </div>
                  </div>

                  {/* Language name */}
                  <h3 className="text-2xl font-semibold text-center text-gray-800 mb-2">
                    {journey.name}
                  </h3>

                  {/* Difficulty */}
                  {journey.difficulty && (
                    <p className="text-center mb-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {journey.difficulty}
                      </span>
                    </p>
                  )}

                  {/* Progress bar if enrolled */}
                  {journey.isEnrolled && journey.completionPercentage !== undefined && (
                    <div className="mb-3 px-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-800 font-medium">
                          {journey.completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${journey.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Coder count */}
                  <p className="text-gray-500 text-center mt-3">
                    {journey.coders} {journey.coders === 1 ? "Coder" : "Coders"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyContent;
