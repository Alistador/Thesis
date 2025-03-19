"use client";

import React, { useRef, useState, useEffect, ReactNode } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";

interface ContentItem {
  title: string;
  description: string;
  content: ReactNode;
}

interface StickyScrollProps {
  content: ContentItem[];
  contentClassName?: string;
}

export const StickyScroll: React.FC<StickyScrollProps> = ({
  content,
  contentClassName = "",
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end end"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    cardsBreakpoints.forEach((breakpoint, index) => {
      if (
        latest > breakpoint - 0.1 &&
        latest <= breakpoint + 1 / cardLength - 0.1
      ) {
        setActiveCard(index);
      }
    });
  });

  const backgroundColors = [
    "var(--purple-500)",
    "var(--blue-500)",
    "var(--teal-500)",
    "var(--cyan-500)",
  ];

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="h-[30rem] md:h-[40rem] overflow-y-auto flex justify-center relative space-y-10 rounded-md border border-white/[0.08] bg-black/[0.05] p-4 md:p-10 backdrop-blur-lg"
      ref={ref}
    >
      <div className="div relative flex flex-col max-w-5xl w-full">
        <ul className="sticky top-0 pt-10 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              {content[activeCard].title}
            </h2>
            <p className="text-white/70 mt-4 max-w-lg mx-auto">
              {content[activeCard].description}
            </p>
          </div>
          <div className="w-full mx-auto mt-10">
            {content[activeCard].content}
          </div>
        </ul>

        {content.map((_, index) => (
          <div key={index} className="h-[40vh] md:h-[80vh]" />
        ))}
      </div>
    </motion.div>
  );
};
