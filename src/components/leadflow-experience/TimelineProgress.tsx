import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface TimelineProgressProps {
  progress: number; // 0–100
  totalSteps: number;
  currentStep: number;
  stepLabels: string[];
}

export default function TimelineProgress({
  progress,
  totalSteps,
  currentStep,
  stepLabels,
}: TimelineProgressProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="w-full space-y-2">
      {/* Progress bar */}
      <div className="h-1 bg-brand-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-blue to-brand-violet rounded-full origin-left"
          style={{ scaleX: progress / 100 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: shouldReduce ? 0.05 : 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between items-center">
        {stepLabels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <motion.div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isCompleted
                    ? "bg-brand-blue"
                    : isCurrent
                    ? "bg-brand-indigo ring-2 ring-brand-indigo/30"
                    : "bg-brand-slate-300"
                }`}
                animate={
                  isCurrent && !shouldReduce
                    ? { scale: [1, 1.4, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 1.2, repeat: isCurrent && !shouldReduce ? Infinity : 0 }}
              />
              <span className={`text-[9px] font-mono hidden sm:block ${
                isCurrent ? "text-brand-indigo font-bold" : isCompleted ? "text-brand-blue" : "text-brand-slate-400"
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
