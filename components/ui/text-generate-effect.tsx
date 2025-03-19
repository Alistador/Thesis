"use client";

import React, { useEffect, useState } from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({
  words,
  className = "",
}) => {
  const [renderedText, setRenderedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (currentIndex >= words.length) {
      return;
    }

    if (isPaused) {
      return;
    }

    const timeout = setTimeout(() => {
      setRenderedText((prev) => prev + words[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, 30);

    return () => clearTimeout(timeout);
  }, [currentIndex, isPaused, words]);

  return (
    <div className={className}>
      <p>{renderedText}</p>
    </div>
  );
};
