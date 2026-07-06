import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Wind, Scale, Home, UtensilsCrossed, Stethoscope, HardHat,
  ArrowUpRight,
} from "lucide-react";
import type { IndustrySolution } from "./solutionsData";

const iconMap: Record<string, React.ElementType> = {
  Wind, Scale, Home, UtensilsCrossed, Stethoscope, HardHat,
};

interface IndustryCardProps {
  industry: IndustrySolution;
  index: number;
  onBookDemo: () => void;
  key?: string;
}

export default function IndustryCard({ industry, index, onBookDemo }: IndustryCardProps) {
  const shouldReduce = useReducedMotion();
  const Icon = iconMap[industry.icon] ?? Wind;

  return (
    <motion.article
      className="group bg-white border border-brand-slate-200 rounded-2xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.07 }}
      whileHover={shouldReduce ? {} : { y: -5, boxShadow: "0 20px 50px -12px rgba(9,13,26,0.12)" }}
      onClick={onBookDemo}
    >
      {/* Header */}
      <div className={`p-5 bg-gradient-to-br ${industry.gradient} border-b border-brand-slate-200/60`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-brand-navy">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <h4 className="font-extrabold text-sm text-brand-navy">{industry.industry}</h4>
          </div>
          <motion.div
            className="w-6 h-6 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={shouldReduce ? {} : { scale: 1.1 }}
            aria-hidden="true"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-brand-blue" />
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            The Problem
          </span>
          <p className="text-xs text-brand-slate-500 leading-relaxed">{industry.challenge}</p>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            Our Solution
          </span>
          <p className="text-xs text-brand-slate-600 leading-relaxed">{industry.solution}</p>
        </div>

        <div className="pt-2 border-t border-brand-slate-100">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs text-brand-slate-600 font-semibold leading-relaxed">{industry.outcome}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
