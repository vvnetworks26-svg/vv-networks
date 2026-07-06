import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface DemoControllerProps {
  isPlaying: boolean;
  isComplete: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSkip: () => void;
}

export default function DemoController({
  isPlaying,
  isComplete,
  onPlay,
  onPause,
  onRestart,
  onSkip,
}: DemoControllerProps) {
  const shouldReduce = useReducedMotion();

  const controls = [
    {
      icon: isPlaying ? Pause : Play,
      label: isPlaying ? "Pause demo" : isComplete ? "Demo complete" : "Play demo",
      onClick: isPlaying ? onPause : onPlay,
      disabled: isComplete && !isPlaying,
      primary: true,
    },
    {
      icon: SkipForward,
      label: "Skip to end",
      onClick: onSkip,
      disabled: isComplete,
      primary: false,
    },
    {
      icon: RotateCcw,
      label: "Restart demo",
      onClick: onRestart,
      disabled: false,
      primary: false,
    },
  ];

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Demo playback controls">
      {controls.map((ctrl) => {
        const Icon = ctrl.icon;
        return (
          <motion.button
            key={ctrl.label}
            onClick={ctrl.onClick}
            disabled={ctrl.disabled}
            aria-label={ctrl.label}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2 ${
              ctrl.primary
                ? "bg-brand-navy text-white hover:bg-brand-blue disabled:opacity-40 disabled:cursor-not-allowed"
                : "bg-white border border-brand-slate-200 text-brand-slate-600 hover:text-brand-navy hover:border-brand-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
            whileHover={ctrl.disabled || shouldReduce ? {} : { scale: 1.03 }}
            whileTap={ctrl.disabled || shouldReduce ? {} : { scale: 0.97 }}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{ctrl.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
