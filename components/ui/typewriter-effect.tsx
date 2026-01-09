"use client";

import { useEffect, useState } from "react";

interface TypewriterEffectProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
}

export function TypewriterEffect({
  words,
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseTime = 2000,
  className = "",
}: TypewriterEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    
    const timer = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(word.substring(0, currentText.length - 1));
      } else {
        setCurrentText(word.substring(0, currentText.length + 1));
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    if (!isDeleting && currentText === word) {
      clearTimeout(timer);
      setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
