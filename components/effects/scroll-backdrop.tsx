"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useState } from "react";

type ScrollBackdropProps = {
  className?: string;
  intensity?: number; // 0.0 - 1.0 to tune movement
};

// Subtle, GPU-accelerated parallax mesh backdrop that reacts to scroll
// Follows existing design: low-opacity, blurred, behind content
export function ScrollBackdrop({ className = "", intensity = 1 }: ScrollBackdropProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  // Movement ranges tuned to be subtle and device-friendly
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 60 * intensity]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -40 * intensity]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.28, 0.4]);

  // Ensure component only renders on client after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use initial static values during SSR, then switch to animated after mount
  const initialY = 0;
  const initialOpacity = 0.28;

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Layer 1: Soft radial gradient blob (brand primary) */}
      <motion.div
        aria-hidden
        style={isMounted ? { y: y1, opacity } : { y: initialY, opacity: initialOpacity }}
        className="absolute -top-32 -left-16 h-[44rem] w-[44rem] rounded-full blur-3xl"
      >
        <div className="h-full w-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent" />
      </motion.div>

      {/* Layer 2: Complementary hue for depth */}
      <motion.div
        aria-hidden
        style={isMounted ? { y: y2, opacity } : { y: initialY, opacity: initialOpacity }}
        className="absolute -bottom-24 -right-24 h-[38rem] w-[38rem] rounded-full blur-3xl"
      >
        <div className="h-full w-full bg-gradient-to-tr from-emerald-400/15 via-primary/10 to-transparent dark:from-emerald-300/10" />
      </motion.div>

      {/* Layer 3: Very subtle geometric sheen */}
      <motion.div
        aria-hidden
        style={isMounted ? { y: y1, opacity } : { y: initialY, opacity: initialOpacity }}
        className="absolute inset-0"
      >
        <div className="h-full w-full bg-[radial-gradient(1200px_600px_at_50%_0%,theme(colors.primary/5),transparent_60%)]" />
      </motion.div>
    </div>
  );
}

export default ScrollBackdrop;
