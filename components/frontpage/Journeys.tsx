"use client";

import React, { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import {
  FaRocket,
  FaPython,
  FaJava,
  FaCode,
  FaDatabase,
  FaTree,
} from "react-icons/fa";
import { HiSparkles, HiChip } from "react-icons/hi";
import { SiJavascript, SiReact, SiHtml5, SiCss3 } from "react-icons/si";
import { PiCodeBlock } from "react-icons/pi";
import { GiMountainRoad, GiPathDistance } from "react-icons/gi";
import { cn } from "@/lib/utils";

// Aceternity UI components
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SparklesCore } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { LampContainer } from "@/components/ui/lamp";

interface Stage {
  id: number;
  name: string;
  description: string;
  levelCount: number;
  icon: ReactNode;
  colorClass: string;
}

interface Journey {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  completionRate: number;
  currentStage: number;
  currentLevel: number;
  totalLevels: number;
  stages: Stage[];
}

// Define stages that are common across journeys with slight variations
const createStages = (language: string, baseColor: string): Stage[] => [
  {
    id: 1,
    name: "Fundamentals",
    description: `Master basic ${language} syntax and core concepts`,
    levelCount: 25,
    icon: <PiCodeBlock />,
    colorClass: `from-${baseColor}-300 to-${baseColor}-400`,
  },
  {
    id: 2,
    name: "Data Structures",
    description: `Learn how to organize and manipulate data in ${language}`,
    levelCount: 20,
    icon: <FaDatabase />,
    colorClass: `from-${baseColor}-400 to-${baseColor}-500`,
  },
  {
    id: 3,
    name: "Problem Solving",
    description: `Apply ${language} concepts to solve real-world challenges`,
    levelCount: 30,
    icon: <HiChip />,
    colorClass: `from-${baseColor}-500 to-${baseColor}-600`,
  },
  {
    id: 4,
    name: "Advanced Concepts",
    description: `Dive into ${language}'s advanced features and patterns`,
    levelCount: 25,
    icon: <GiPathDistance />,
    colorClass: `from-${baseColor}-600 to-${baseColor}-700`,
  },
  {
    id: 5,
    name: "Project Mastery",
    description: `Build complete ${language} applications from scratch`,
    levelCount: 20,
    icon: <FaRocket />,
    colorClass: `from-${baseColor}-700 to-${baseColor}-800`,
  },
];

// Mock data for coding journeys
const journeys: Journey[] = [
  {
    id: 1,
    title: "Python Journey",
    description:
      "Master Python from basics to advanced concepts through hands-on coding challenges",
    icon: <FaPython className="text-4xl" />,
    color: "from-emerald-500 to-teal-600",
    completionRate: 62,
    currentStage: 3,
    currentLevel: 14,
    totalLevels: 120,
    stages: createStages("Python", "emerald"),
  },
  {
    id: 2,
    title: "Java Journey",
    description:
      "Learn object-oriented programming through the Java ecosystem and enterprise concepts",
    icon: <FaJava className="text-4xl" />,
    color: "from-blue-500 to-indigo-600",
    completionRate: 23,
    currentStage: 2,
    currentLevel: 5,
    totalLevels: 120,
    stages: createStages("Java", "blue"),
  },
  {
    id: 3,
    title: "Web Development",
    description:
      "Build responsive, interactive websites with HTML, CSS, and JavaScript",
    icon: <SiHtml5 className="text-4xl" />,
    color: "from-orange-500 to-red-600",
    completionRate: 78,
    currentStage: 4,
    currentLevel: 18,
    totalLevels: 120,
    stages: [
      {
        id: 1,
        name: "HTML Fundamentals",
        description: "Structure web content with semantic markup",
        levelCount: 20,
        icon: <SiHtml5 />,
        colorClass: "from-orange-300 to-orange-400",
      },
      {
        id: 2,
        name: "CSS Styling",
        description: "Design beautiful layouts and responsive interfaces",
        levelCount: 25,
        icon: <SiCss3 />,
        colorClass: "from-orange-400 to-orange-500",
      },
      {
        id: 3,
        name: "JavaScript Basics",
        description: "Add interactivity and dynamic behavior to your web pages",
        levelCount: 30,
        icon: <SiJavascript />,
        colorClass: "from-orange-500 to-orange-600",
      },
      {
        id: 4,
        name: "DOM Manipulation",
        description: "Control the document structure and handle user events",
        levelCount: 25,
        icon: <FaCode />,
        colorClass: "from-orange-600 to-orange-700",
      },
      {
        id: 5,
        name: "Modern Web Apps",
        description: "Build single-page applications with modern frameworks",
        levelCount: 20,
        icon: <SiReact />,
        colorClass: "from-orange-700 to-orange-800",
      },
    ],
  },
];

const Journeys: React.FC = () => {
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <LampContainer className="mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl font-bold text-center text-white"
        >
          Coding Journeys
        </motion.h1>

        <TextGenerateEffect
          words="Embark on progressive learning paths with 5 stages and over 100 interactive coding challenges in each journey."
          className="text-xl text-center max-w-3xl mx-auto mt-4 text-white/80"
        />
      </LampContainer>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        {selectedJourney ? (
          // Stage view for selected journey
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Journey header with back button */}
            <div className="flex items-center mb-8">
              <button
                onClick={() => setSelectedJourney(null)}
                className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex items-center">
                <span className="bg-white/10 p-3 rounded-full mr-3">
                  {selectedJourney.icon}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedJourney.title}
                  </h2>
                  <div className="flex items-center mt-1">
                    <div className="h-2 w-36 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${selectedJourney.color}`}
                        style={{ width: `${selectedJourney.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-white/70 text-sm">
                      {selectedJourney.completionRate}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey stages */}
            <div className="space-y-8">
              {selectedJourney.stages.map((stage, index) => {
                const isCurrentStage =
                  selectedJourney.currentStage === stage.id;
                const isCompleted = selectedJourney.currentStage > stage.id;
                const isLocked = selectedJourney.currentStage < stage.id;

                return (
                  <div
                    key={stage.id}
                    className={`relative ${
                      isLocked ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    {/* Connection line between stages */}
                    {index < selectedJourney.stages.length - 1 && (
                      <div className="absolute left-8 top-16 w-1 h-24 bg-white/20 z-0"></div>
                    )}

                    <div className="relative z-10 flex gap-6">
                      {/* Stage icon */}
                      <div
                        className={`h-16 w-16 flex-shrink-0 rounded-full flex items-center justify-center text-2xl ${
                          isCurrentStage
                            ? `bg-gradient-to-br ${selectedJourney.color}`
                            : isCompleted
                            ? "bg-white/20"
                            : "bg-white/10"
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          stage.icon
                        )}
                      </div>

                      {/* Stage content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {stage.name}
                          </h3>
                          <span className="text-white/70 text-sm">
                            {stage.levelCount} Levels
                          </span>
                        </div>
                        <p className="text-white/70 mb-4">
                          {stage.description}
                        </p>

                        {/* Level progression */}
                        {isCurrentStage && (
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white/80">
                                Your progress
                              </span>
                              <span className="text-white font-medium">
                                Level {selectedJourney.currentLevel}/
                                {stage.levelCount}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${selectedJourney.color}`}
                                style={{
                                  width: `${
                                    (selectedJourney.currentLevel /
                                      stage.levelCount) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Stage action button */}
                        <div className="mt-4">
                          {isCompleted ? (
                            <button className="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors">
                              Review Stage
                            </button>
                          ) : isCurrentStage ? (
                            <button
                              className={`px-4 py-2 rounded-lg bg-gradient-to-r ${selectedJourney.color} text-white hover:shadow-lg transition-all`}
                            >
                              Continue Learning
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-4 py-2 rounded-lg bg-white/5 text-white/50 cursor-not-allowed"
                            >
                              Locked
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          // Journey cards grid view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journeys.map((journey) => (
              <CardContainer key={journey.id} className="w-full">
                <CardBody className="bg-gray-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full">
                  {/* Journey icon and header */}
                  <CardItem translateZ="80" className="w-full mb-4">
                    <BackgroundGradient
                      className={`w-full rounded-lg bg-gradient-to-br ${journey.color}`}
                      containerClassName="w-full aspect-video mb-4 rounded-lg"
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 rounded-lg">
                        <span className="text-white text-6xl mb-4">
                          {journey.icon}
                        </span>
                        <h3 className="text-2xl font-bold text-white text-center">
                          {journey.title}
                        </h3>
                      </div>
                    </BackgroundGradient>
                  </CardItem>

                  {/* Journey description */}
                  <CardItem translateZ="40" className="w-full">
                    <p className="text-white/80 text-sm mb-4">
                      {journey.description}
                    </p>
                  </CardItem>

                  {/* Journey progress */}
                  <CardItem translateZ="60" className="w-full">
                    <div className="mb-2 flex justify-between">
                      <span className="text-white/70 text-sm">Completion</span>
                      <span className="text-white/90 text-sm font-medium">
                        {journey.completionRate}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full bg-gradient-to-r ${journey.color}`}
                        style={{ width: `${journey.completionRate}%` }}
                      ></div>
                    </div>
                  </CardItem>

                  {/* Journey stats */}
                  <CardItem translateZ="50" className="w-full">
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-white/60 text-xs">
                          Current Stage
                        </div>
                        <div className="text-white font-medium flex items-baseline">
                          <span className="text-xl mr-1">
                            {journey.currentStage}
                          </span>
                          <span className="text-white/60 text-xs">of 5</span>
                        </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg">
                        <div className="text-white/60 text-xs">
                          Total Levels
                        </div>
                        <div className="text-white font-medium text-xl">
                          {journey.totalLevels}
                        </div>
                      </div>
                    </div>
                  </CardItem>

                  {/* Call to action */}
                  <CardItem translateZ="100" className="w-full mt-2">
                    <button
                      onClick={() => setSelectedJourney(journey)}
                      className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                    >
                      Explore Journey
                    </button>
                  </CardItem>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Journeys;
