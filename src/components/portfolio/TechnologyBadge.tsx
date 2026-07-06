import React from "react";
import { motion, useReducedMotion } from "motion/react";

const techColors: Record<string, { bg: string; text: string; border: string }> = {
  React:        { bg: "bg-cyan-50",        text: "text-cyan-700",      border: "border-cyan-200" },
  TypeScript:   { bg: "bg-blue-50",        text: "text-blue-700",      border: "border-blue-200" },
  "Node.js":    { bg: "bg-emerald-50",     text: "text-emerald-700",   border: "border-emerald-200" },
  MongoDB:      { bg: "bg-green-50",       text: "text-green-700",     border: "border-green-200" },
  PostgreSQL:   { bg: "bg-sky-50",         text: "text-sky-700",       border: "border-sky-200" },
  Redis:        { bg: "bg-red-50",         text: "text-red-700",       border: "border-red-200" },
  "Gemini AI":  { bg: "bg-violet-50",      text: "text-violet-700",    border: "border-violet-200" },
  OpenAI:       { bg: "bg-violet-50",      text: "text-violet-700",    border: "border-violet-200" },
  FastAPI:      { bg: "bg-teal-50",        text: "text-teal-700",      border: "border-teal-200" },
  Docker:       { bg: "bg-blue-50",        text: "text-blue-700",      border: "border-blue-200" },
  Vercel:       { bg: "bg-brand-navy/5",   text: "text-brand-navy",    border: "border-brand-navy/15" },
  "AWS S3":     { bg: "bg-orange-50",      text: "text-orange-700",    border: "border-orange-200" },
  "Google Calendar": { bg: "bg-blue-50",   text: "text-blue-700",      border: "border-blue-200" },
};

const fallback = { bg: "bg-brand-slate-100", text: "text-brand-slate-600", border: "border-brand-slate-200" };

interface TechnologyBadgeProps {
  name: string;
  index?: number;
  animate?: boolean;
  key?: string;
}

export default function TechnologyBadge({ name, index = 0, animate = true }: TechnologyBadgeProps) {
  const shouldReduce = useReducedMotion();
  const colors = techColors[name] ?? fallback;

  if (!animate) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
        {name}
      </span>
    );
  }

  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
      initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: shouldReduce ? 0.1 : 0.3,
        delay: shouldReduce ? 0 : index * 0.05,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={shouldReduce ? {} : { scale: 1.06, y: -1 }}
    >
      {name}
    </motion.span>
  );
}
