import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
  key?: string | number;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
}: ScrollRevealProps) {
  const shouldReduce = useReducedMotion();

  const directionMap = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { y: 0, x: 24 },
    right: { y: 0, x: -24 },
    none: { y: 0, x: 0 },
  };

  const offset = directionMap[direction];

  return (
    <motion.div
      className={className}
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration: shouldReduce ? 0.15 : 0.55,
        delay: shouldReduce ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
