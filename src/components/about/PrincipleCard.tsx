import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  TrendingUp, Layers, Code, Compass, RefreshCw, Star,
} from "lucide-react";
import type { Principle } from "./companyData";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, Layers, Code, Compass, RefreshCw, Star,
};

interface PrincipleCardProps {
  principle: Principle;
  index: number;
  key?: string;
}

const PrincipleCard = memo(function PrincipleCard({ principle, index }: PrincipleCardProps) {
  const shouldReduce = useReducedMotion();
  const Icon = iconMap[principle.icon] ?? Star;

  return (
    <motion.article
      className="p-6 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.07 }}
      whileHover={shouldReduce ? {} : { y: -4, boxShadow: "0 16px 48px -12px rgba(9,13,26,0.1)" }}
    >
      <motion.div
        className="w-10 h-10 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors"
        whileHover={shouldReduce ? {} : { rotate: -5, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </motion.div>
      <h4 className="text-sm font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
        {principle.title}
      </h4>
      <p className="text-xs text-brand-slate-500 leading-relaxed">{principle.description}</p>
    </motion.article>
  );
});

export default PrincipleCard;
