// components/journey/HexButton.tsx
"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Lock } from "lucide-react";

interface HexButtonProps {
  id: number;
  icon: React.ReactNode;
  label: string;
  status: "locked" | "completed" | "next" | "available";
  isActive: boolean;
  journeySlug: string;
  onClick: (id: number) => void;
  clickable?: boolean;
}

export const HexButton: React.FC<HexButtonProps> = ({
  id,
  icon,
  label,
  status,
  isActive,
  journeySlug,
  onClick,
  clickable = false
}) => {
  // Choose the appropriate SVG based on the status - simplified logic
  let baseHexPath = "/hex-closed-base.svg"; // default for locked/unavailable
  
  if (status === "completed") {
    baseHexPath = "/hex-done-base.svg";
  } 
  
  // Active state takes precedence over status
  if (isActive) {
    baseHexPath = "/hex-active-base.svg";
  }
  
  // Determine if the button is disabled (locked or explicitly not clickable)
  const isDisabled = status === "locked" || !clickable;
  
  // Determine click animation classes
  const clickAnimationClass = !isDisabled ? 'hover:scale-105 hover:brightness-105' : '';
  
  // Handle click to directly call the onClick handler
  const handleClick = (e: React.MouseEvent) => {
    if (!isDisabled) {
      onClick(id);
    }
  };
  
  return (
    <div className="relative">
      {/* The button itself */}
      <div 
        className={`block ${isDisabled ? 'opacity-50' : ''} group cursor-pointer`}
        onClick={handleClick}
      >
        <div 
          className={`relative w-16 h-20 transition-all duration-200 
                     ${clickAnimationClass}`}
          role="button"
          aria-label={`${label} level${isDisabled ? ' (locked)' : ''}`}
          tabIndex={isDisabled ? -1 : 0}
        >
          {/* Use the SVG files with status-based differentiation - simplified */}
          <img src={baseHexPath} alt="" className="absolute top-0 left-0 w-full h-full" />
          
          {/* Icon in the center */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isDisabled ? (
              <div className="z-40 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
            ) : (
              <div className="z-20 text-white">
                {icon}
              </div>
            )}
          </div>
          
          {/* Label below the hexagon */}
          <div className="absolute bottom-0 left-0 right-0 text-center mt-2 text-xs">
            {label}
          </div>
          
          {/* Add highlight border if active */}
          {isActive && (
            <div className="absolute inset-0 border-2 border-blue-300 z-10 scale-105"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};