import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Gauge, ShieldCheck, Eye, GitBranch, BarChart3, CheckCircle2,
} from "lucide-react";
import type { EngineeringStandard } from "./companyData";

const iconMap: Record<string, React.ElementType> = {
  Gauge, ShieldCheck, Eye, GitBranch, BarChart3, CheckCircle2,
};

interface EngineeringCardProps {
  standard: EngineeringStandard;
  index: number;
  key?: string;
}

const EngineeringCard = memo(function EngineeringCard({ standard, index }: EngineeringCardProps) {
  const shouldReduce = useReducedMotion();
  const Icon = iconMap[standard.icon] ?? Gauge;

  return (
    <motion.article
      className="p-5 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.07 }}
      whileHover={shouldReduce ? {} : { y: -4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${standard.badgeColor}`}>
          {standard.badgeText}
        </span>
      </div>

      <h4 className="text-sm font-bold text-brand-navy mb-1.5">{standard.title}</h4>
      <p className="text-xs text-brand-slate-500 leading-relaxed mb-4">{standard.description}</p>

      <div className="border-t border-brand-slate-100 pt-3 flex items-baseline gap-1.5">
        <span className="text-xl font-black font-mono text-brand-navy">{standard.metric}</span>
        <span className="text-[10px] text-brand-slate-400">{standard.metricLabel}</span>
      </div>
    </motion.article>
  );
});

export default EngineeringCard;
