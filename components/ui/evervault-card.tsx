"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const EvervaultCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const { left, top } = cardRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      setMousePosition({ x, y });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      className={cn(
        "relative h-full w-full rounded-xl border border-white/10 bg-gradient-to-br from-black to-black/70 p-px overflow-hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100">
        <div
          className="absolute inset-0 rounded-xl opacity-70 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 190, 255, 0.15), transparent 40%)`,
          }}
        />
        <div
          className="absolute inset-0 rounded-xl opacity-70 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 190, 255, 0.4), transparent 40%)`,
          }}
        />
        <div className="absolute inset-px rounded-[11px] bg-gradient-to-br from-black to-black/90" />
      </div>
      <div className="relative h-full w-full rounded-xl bg-black p-1 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
};
