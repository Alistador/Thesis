"use client";

import React, { useEffect, useRef, useState } from "react";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  position: number;
  onResize: (newPosition: number) => void;
  min?: number;
  max?: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ResizeHandle({
  direction,
  position,
  onResize,
  min = 15,
  max = 50,
  containerRef,
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!handleRef.current || !containerRef.current) return;

    const container = containerRef.current;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();

      if (direction === "horizontal") {
        const newWidth =
          ((e.clientX - containerRect.left) / containerRect.width) * 100;
        onResize(Math.max(min, Math.min(max, newWidth)));
      } else {
        const newHeight = e.clientY - containerRect.top;
        onResize(Math.max(min, Math.min(max, newHeight)));
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
    };

    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, direction, min, max, onResize, containerRef]);

  return (
    <div
      ref={handleRef}
      className={`absolute z-10 ${
        direction === "horizontal"
          ? "h-full cursor-col-resize"
          : "w-full cursor-row-resize"
      }`}
      style={{
        [direction === "horizontal" ? "left" : "top"]: `${position}%`,
        [direction === "horizontal" ? "width" : "height"]: "10px",
        transform:
          direction === "horizontal" ? "translateX(-50%)" : "translateY(-50%)",
      }}
      onMouseDown={() => {
        setIsDragging(true);
        document.body.style.cursor =
          direction === "horizontal" ? "col-resize" : "row-resize";
      }}
    />
  );
}

// Horizontal resize wrapper
export function HorizontalResizeHandle(
  props: Omit<ResizeHandleProps, "direction">
) {
  return <ResizeHandle direction="horizontal" {...props} />;
}

// Vertical resize wrapper
export function VerticalResizeHandle(
  props: Omit<ResizeHandleProps, "direction">
) {
  return <ResizeHandle direction="vertical" {...props} />;
}
