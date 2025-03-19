"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useScroll,
  useVelocity,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundBeamsProps {
  className?: string;
}

export const BackgroundBeams: React.FC<BackgroundBeamsProps> = ({
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll();
  const scrollYProgressVelocity = useVelocity(scrollYProgress);
  const [scrollYProgressVelocityScaled] = useState(0);

  const spring = useSpring(scrollYProgressVelocityScaled, {
    damping: 50,
    stiffness: 400,
  });

  const opacity = useTransform(spring, [-0.05, 0, 0.05], [0, 1, 0]);
  const intensity = useTransform(scrollYProgress, [0, 1], [0.6, 1.8]);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setSize({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        filter: "blur(40px)",
        opacity: opacity,
        backgroundColor: "transparent",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(120, 0, 255, 0.15), transparent 30%),
            radial-gradient(circle at top right, rgba(0, 223, 255, 0.15), transparent 30%),
            radial-gradient(at bottom left, rgba(0, 223, 255, 0.15), transparent 30%),
            radial-gradient(at bottom right, rgba(120, 0, 255, 0.15), transparent 30%)
          `,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
    </motion.div>
  );
};
