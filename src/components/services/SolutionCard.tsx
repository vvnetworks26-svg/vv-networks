import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Bot, Globe, Code, Zap, ArrowRight, Check, ChevronDown, Clock,
} from "lucide-react";
import type { Solution } from "./solutionsData";

const iconMap: Record<string, React.ElementType> = { Bot, Globe, Code, Zap };

interface SolutionCardProps {
  solution: Solution;
  index: number;
  onBookDemo: () => void;
  key?: string;
}

export default function SolutionCard({ solution, index, onBookDemo }: SolutionCardProps) {
  const shouldReduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[solution.icon] ?? Bot;

  return (
    <motion.article
      className={`bg-white border border-brand-slate-200 rounded-3xl overflow-hidden group flex flex-col ${
        solution.id === "leadflow" ? "border-brand-blue/20 shadow-lg shadow-brand-blue/5" : ""
      }`}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: shouldReduce ? 0.1 : 0.45, delay: shouldReduce ? 0 : index * 0.09 }}
      whileHover={shouldReduce ? {} : { y: -5, boxShadow: "0 24px 60px -15px rgba(9,13,26,0.13)" }}
    >
      {/* Header gradient */}
      <div className={`p-6 bg-gradient-to-br ${solution.gradient} border-b border-brand-slate-200/60 relative overflow-hidden`}>
        {solution.id === "leadflow" && (
          <span className="absolute top-4 right-4 text-[9px] font-mono font-bold uppercase tracking-wider bg-brand-blue text-white px-2.5 py-1 rounded-full">
            Flagship
          </span>
        )}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 flex items-center justify-center text-brand-blue shadow-sm flex-shrink-0">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-brand-navy leading-tight">{solution.name}</h3>
            <p className="text-xs text-brand-slate-500 mt-0.5 leading-relaxed">{solution.tagline}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col space-y-5">

        {/* Outcomes */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            Business Outcomes
          </span>
          <div className="space-y-1.5">
            {solution.outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs text-brand-slate-600 leading-relaxed">{outcome}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable capabilities */}
        <div className="border-t border-brand-slate-100 pt-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between text-xs font-bold text-brand-slate-600 hover:text-brand-navy transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue rounded"
            aria-expanded={expanded}
            aria-controls={`capabilities-${solution.id}`}
          >
            <span>What's included</span>
            <motion.div
              animate={shouldReduce ? {} : { rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            >
              <ChevronDown className="w-4 h-4 text-brand-slate-400" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id={`capabilities-${solution.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: shouldReduce ? 0.1 : 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-1.5">
                  {solution.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-brand-blue/50 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-brand-slate-500">{cap}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-2 mt-auto border-t border-brand-slate-100 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-brand-navy block">{solution.pricing}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-brand-slate-400" aria-hidden="true" />
            <span className="text-[10px] text-brand-slate-400">{solution.deliveryTime}</span>
          </div>
        </div>
        <button
          onClick={onBookDemo}
          className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-indigo transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue rounded group/cta"
          aria-label={`Book a demo for ${solution.name}`}
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  );
}
