"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  content: string;
}

interface InfiniteMovingCardsProps {
  items: Testimonial[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
}

export const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [duration, setDuration] = useState(40);

  // Set animation duration based on speed prop
  useEffect(() => {
    switch (speed) {
      case "fast":
        setDuration(20);
        break;
      case "normal":
        setDuration(30);
        break;
      case "slow":
        setDuration(40);
        break;
      default:
        setDuration(30);
    }
  }, [speed]);

  // Measure the container width
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Duplicate items for a seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <motion.div
        className="flex gap-4 py-4"
        initial={{ x: direction === "right" ? -containerWidth : 0 }}
        animate={{ x: direction === "right" ? 0 : -containerWidth }}
        transition={{
          duration: duration,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
        {...(pauseOnHover && { whileHover: { animationPlayState: "paused" } })}
      >
        {duplicatedItems.map((testimonial, idx) => (
          <div
            key={`${testimonial.id}-${idx}`}
            className="flex-shrink-0 w-[350px] md:w-[450px] group cursor-pointer"
          >
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-full transition-colors group-hover:bg-white/10">
              <div className="flex items-center gap-4 mb-4">
                {testimonial.avatar && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for missing images
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          testimonial.name
                        )}&background=random`;
                      }}
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">{testimonial.name}</h3>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-white/80 italic">"{testimonial.content}"</p>

              {/* Star rating */}
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
