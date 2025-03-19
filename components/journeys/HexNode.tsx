// components/journey/HexNode.tsx
"use client";

import React from "react";

// Update the interface to match the database-driven approach
interface LearningPathNode {
  id: number;
  label: string;
  status: "completed" | "next" | "available" | "locked";
  icon: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
}

interface HexNodeProps {
  node: LearningPathNode;
  clickedNode: number | null;
  onNodeClick: (id: number, disabled: boolean) => void;
}

export const HexNode: React.FC<HexNodeProps> = ({ node, clickedNode, onNodeClick }) => {
  // Choose the appropriate SVG based on the node status - simplified logic
  let baseSvgPath = "/hex-closed-base.svg"; // default for locked/unavailable
  
  if (node.status === "completed") {
    baseSvgPath = "/hex-done-base.svg";
  }
  
  // Active state takes precedence over status
  if (node.active) {
    baseSvgPath = "/hex-active-base.svg";
  }
  
  // Determine click animation classes
  const isClicked = clickedNode === node.id;
  const clickAnimationClass = !node.disabled ? (isClicked ? 'scale-90 brightness-110' : 'hover:scale-105 hover:brightness-105') : '';
  
  // Ensure disabled is a boolean, defaulting to false if undefined
  const isDisabled = node.disabled === true;
  
  return (
    <div 
      key={node.id}
      className={`relative w-16 h-20 cursor-pointer transition-all duration-200 
                 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} 
                 ${clickAnimationClass}`}
      onClick={() => onNodeClick(node.id, isDisabled)}
      role="button"
      aria-label={`${node.label} level`}
      tabIndex={isDisabled ? -1 : 0}
    >
      {/* Use different SVG files based on status */}
      <img src={baseSvgPath} alt="" className="absolute top-0 left-0 w-full h-full" />
      
      {/* Icon in the center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`z-20 text-white ${isClicked ? 'transform scale-90' : ''}`}>
          {node.icon}
        </div>
      </div>
      
      {/* Label below the hexagon */}
      <div className="absolute bottom-0 left-0 right-0 text-center mt-2 text-xs">
        {node.label}
      </div>
      
      {/* Add highlight border if active */}
      {node.active && (
        <div className="absolute inset-0 border-2 border-blue-300 z-10 scale-105"
          style={{
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
      )}
    </div>
  );
};