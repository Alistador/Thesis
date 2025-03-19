"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedTooltip = ({
  items,
  className,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center gap-2",
        className
      )}
    >
      {items.map((item, idx) => (
        <AnimatedTooltipItem key={item.id} item={item} />
      ))}
    </div>
  );
};

const AnimatedTooltipItem = ({
  item,
}: {
  item: {
    id: number;
    name: string;
    designation: string;
    image: string;
  };
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative flex cursor-pointer items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white p-1">
        <Image
          src={item.image}
          alt={item.name}
          height={48}
          width={48}
          className="h-full w-full object-cover rounded-full"
        />
      </div>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute -top-16 z-50 flex flex-col items-center"
        >
          <div className="relative flex flex-col items-center rounded-md bg-black/80 backdrop-blur-sm px-4 py-2 text-center shadow-xl">
            <div className="text-base font-bold text-white">{item.name}</div>
            <div className="text-xs text-white/60">{item.designation}</div>
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black/80"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
