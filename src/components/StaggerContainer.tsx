import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export default function StaggerContainer({
  children,
  className,
  staggerDelay = 0.09,
  once = true,
}: StaggerContainerProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduce ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  key?: string | number;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduce ? 0.15 : 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
