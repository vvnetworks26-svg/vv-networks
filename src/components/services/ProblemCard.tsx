import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  PhoneOff, Clock, Repeat, Link2Off, TrendingDown, AlertCircle,
} from "lucide-react";
import type { BusinessProblem } from "./solutionsData";

const iconMap: Record<string, React.ElementType> = {
  PhoneOff, Clock, Repeat, Link2Off, TrendingDown, AlertCircle,
};

interface ProblemCardProps {
  problem: BusinessProblem;
  index: number;
  key?: string;
}

export default function ProblemCard({ problem, index }: ProblemCardProps) {
  const shouldReduce = useReducedMotion();
  const Icon = iconMap[problem.icon] ?? AlertCircle;

  return (
    <motion.article
      className="group relative p-6 bg-white border border-brand-slate-200 rounded-2xl overflow-hidden cursor-default"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.07 }}
      whileHover={shouldReduce ? {} : { y: -4, boxShadow: "0 16px 48px -12px rgba(9,13,26,0.12)" }}
    >
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-blue/3 to-brand-violet/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      <div className="relative space-y-4">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-brand-blue/8 group-hover:text-brand-blue transition-colors">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
            {problem.title}
          </h4>
          <p className="text-xs text-brand-slate-500 leading-relaxed">{problem.description}</p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-rose-700">{problem.impact}</span>
        </div>
      </div>
    </motion.article>
  );
}
