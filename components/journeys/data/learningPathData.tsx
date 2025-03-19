// components/journey/learningPathData.tsx
import React, { ReactNode } from "react";
import { Star, Grid, Code, FileCode, Database, Gift } from "lucide-react";

// Type definitions
export type NodeStatus = "locked" | "next" | "available" | "completed";
export type NodeHighlight = "blue" | "green" | "yellow" | "purple" | "red" | "orange" | null;

export interface LearningPathNode {
  id: number;
  icon: ReactNode;
  label: string;
  active?: boolean;
  completed?: boolean;
  status?: NodeStatus;
  disabled?: boolean;
  highlight?: NodeHighlight;
}

// Learning path data
export const createLearningPathNodes = (activeNode: number): LearningPathNode[] => {
  return [
    { 
      id: 1, 
      icon: <Star className="text-white" />, 
      label: "Intro", 
      completed: true,
      status: "completed"
    },
    { 
      id: 2, 
      icon: <Grid className="text-white" />, 
      label: "Variables", 
      active: activeNode === 2,
      highlight: "blue",
      status: "next"
    },
    { 
      id: 3, 
      icon: <Code className="text-white" />, 
      label: "Operators", 
      active: activeNode === 3,
      highlight: activeNode === 3 ? "blue" : null
    },
    { 
      id: 4, 
      icon: <Star className="text-white" />, 
      label: "Flow", 
      active: activeNode === 4,
      highlight: activeNode === 4 ? "blue" : null
    },
    { 
      id: 5, 
      icon: <FileCode className="text-white" />, 
      label: "Functions", 
      active: activeNode === 5,
      highlight: activeNode === 5 ? "blue" : null,
      status: "locked",
      disabled: true
    },
    { 
      id: 6, 
      icon: <Star className="text-white" />, 
      label: "Classes", 
      active: activeNode === 6,
      highlight: activeNode === 6 ? "blue" : null,
      status: "locked",
      disabled: true
    },
    { 
      id: 7, 
      icon: <Database className="text-white" />, 
      label: "Advanced", 
      active: activeNode === 7,
      highlight: activeNode === 7 ? "blue" : null,
      status: "locked",
      disabled: true
    },
    { 
      id: 8, 
      icon: <Gift className="text-white" />, 
      label: "Final", 
      active: activeNode === 8,
      highlight: activeNode === 8 ? "blue" : null,
      status: "locked",
      disabled: true
    }
  ];
};