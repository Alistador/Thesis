"use client";

import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Add this at the top of the file to tell TypeScript to ignore type checking for specific values
declare module "@tsparticles/react";
declare module "@tsparticles/slim";

interface SparklesCoreProps {
  id: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  className?: string;
}

export const SparklesCore: React.FC<SparklesCoreProps> = ({
  id,
  background,
  minSize = 0.5,
  maxSize = 1.5,
  particleDensity = 800,
  particleColor = "#fff",
  className = "",
}) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    // Initialize tsParticles
    const initParticles = async () => {
      try {
        await initParticlesEngine(async (engine) => {
          await loadSlim(engine);
        });
        setInit(true);
      } catch (error) {
        console.error("Failed to initialize particles engine:", error);
      }
    };

    initParticles();
  }, []);

  // Using a simpler approach with any type for the options
  // This is acceptable since the library's type definitions are complex
  // and we're using a fairly standard configuration
  const options: any = {
    background: {
      color: {
        value: background || "#000",
      },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    particles: {
      color: {
        value: particleColor,
      },
      move: {
        enable: true,
        outModes: {
          default: "bounce", // This is a valid string value the library expects
        },
        speed: { min: 0.5, max: 1 },
        random: true,
      },
      number: {
        density: {
          enable: true,
          area: particleDensity,
        },
        value: 0,
      },
      opacity: {
        value: { min: 0.3, max: 0.7 },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: minSize, max: maxSize },
      },
      blur: {
        value: 0,
      },
    },
  };

  return (
    <div className={className}>
      {init && (
        <Particles id={id} options={options} className="w-full h-full" />
      )}
    </div>
  );
};
