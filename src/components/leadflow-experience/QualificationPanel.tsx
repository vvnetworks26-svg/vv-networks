import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import type { QualificationChip } from "./types";

interface QualificationPanelProps {
  chips: QualificationChip[];
  currentTime: number;
}

export default function QualificationPanel({ chips, currentTime }: QualificationPanelProps) {
  const shouldReduce = useReducedMotion();
  const visibleChips = chips.filter((chip) => currentTime >= chip.order);

  if (visibleChips.length === 0) return null;

  return (
    <motion.div
      className="bg-white border border-brand-slate-200 rounded-2xl p-5 space-y-4"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduce ? 0.15 : 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
        <h4 className="text-xs font-bold text-brand-navy">Lead Qualification</h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleChips.map((chip, index) => (
          <motion.div
            key={chip.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full"
            initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.85, x: shouldReduce ? 0 : -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{
              duration: shouldReduce ? 0.1 : 0.35,
              delay: shouldReduce ? 0 : index * 0.1,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            <span className="text-[10px] font-bold text-emerald-900">
              {chip.label}: <span className="font-semibold">{chip.value}</span>
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="pt-3 border-t border-brand-slate-100 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduce ? 0 : visibleChips.length * 0.1 + 0.2 }}
      >
        <span className="text-[10px] font-mono text-brand-slate-400 uppercase tracking-wider">
          Qualification Score
        </span>
        <div className="flex items-baseline gap-1">
          <motion.span
            className="text-lg font-black text-emerald-600 font-mono"
            initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: shouldReduce ? 0 : visibleChips.length * 0.1 + 0.3, type: "spring", stiffness: 400 }}
          >
            {Math.round((visibleChips.length / chips.length) * 100)}
          </motion.span>
          <span className="text-xs text-emerald-600 font-semibold">/ 100</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
