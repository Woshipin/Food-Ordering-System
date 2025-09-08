"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter = ({
  text,
  speed = 100,
  className,
  onComplete,
}: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text || currentIndex >= text.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + text[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [text, currentIndex, speed, onComplete]);

  return <span className={className}>{displayedText}</span>;
};