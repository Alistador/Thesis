"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface HoveringIconProps {
  icon: ReactNode;
  label: string;
}

export const HoveringIcon: React.FC<HoveringIconProps> = ({ icon, label }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-2"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl bg-black/30 backdrop-blur-sm border border-white/[0.08] shadow-inner shadow-white/[0.05] group">
        <div className="text-3xl md:text-4xl transition-transform group-hover:scale-110">
          {icon}
        </div>
        <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white/80 text-sm">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};
