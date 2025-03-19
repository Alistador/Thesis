"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealCardProps {
  text: string;
  revealText: string;
  className?: string;
}

export const TextRevealCard: React.FC<TextRevealCardProps> = ({
  text,
  revealText,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "border border-white/[0.08] group/card relative overflow-hidden bg-gradient-to-br from-black/20 to-black/60 backdrop-blur-lg w-full h-60 rounded-xl p-8 flex items-center justify-center",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

      {/* Glowing orbs */}
      <div className="absolute -top-40 -left-20 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-[100px] group-hover/card:opacity-30 transition-opacity duration-500" />
      <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-cyan-500 rounded-full opacity-20 blur-[100px] group-hover/card:opacity-30 transition-opacity duration-500" />

      <div className="relative flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 1 }}
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="text-2xl md:text-4xl font-bold text-center text-white"
        >
          {text}
        </motion.h2>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500 absolute"
        >
          {revealText}
        </motion.h2>
      </div>
    </div>
  );
};
