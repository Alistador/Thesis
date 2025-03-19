"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";

interface LampContainerProps {
  children: ReactNode;
  className?: string;
}

interface MousePosition {
  x: number;
  y: number;
}

export const LampContainer: React.FC<LampContainerProps> = ({
  children,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full ${className}`}
    >
      <div className="relative z-10 w-full">
        {/* Lamp light effect */}
        <motion.div
          className="absolute -top-40 w-56 h-56 bg-purple-500 rounded-full opacity-50 blur-[100px] -z-10"
          animate={{
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
          }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 150,
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};
