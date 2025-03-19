"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface TracingBeamProps {
  children: ReactNode;
  className?: string;
}

export const TracingBeam: React.FC<TracingBeamProps> = ({
  children,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
  }, []);

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [50, svgHeight - 50]),
    { stiffness: 500, damping: 90 }
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 50]),
    { stiffness: 500, damping: 90 }
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="absolute left-4 md:left-12 top-0 bottom-0 w-px h-full bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0" />
        <svg
          className="absolute left-4 md:left-12 top-0 w-6 h-full"
          width="16"
          height={svgHeight}
          viewBox={`0 0 16 ${svgHeight}`}
          fill="none"
        >
          <motion.path
            d={`M8 0V${svgHeight}`}
            stroke="url(#pulse-1)"
            strokeOpacity="0.8"
            strokeWidth="2"
          />
          <defs>
            <motion.linearGradient
              id="pulse-1"
              gradientUnits="userSpaceOnUse"
              x1="8"
              y1={y1}
              x2="8"
              y2={y2}
            >
              <stop stopColor="#44BCFF" stopOpacity="0" />
              <stop stopColor="#44BCFF" />
              <stop offset="1" stopColor="#44BCFF" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>

        <div ref={contentRef} className="ml-8 md:ml-20">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
