import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Clock, ArrowRight, User } from "lucide-react";
import type { EngagementModel } from "./pricingData";

interface EngagementCardProps {
  model: EngagementModel;
  index: number;
  onSelect: () => void;
  key?: string;
}

const EngagementCard = memo(function EngagementCard({ model, index, onSelect }: EngagementCardProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.article
      className={`relative bg-white rounded-3xl border flex flex-col h-full overflow-hidden group ${
        model.highlight
          ? "border-brand-indigo shadow-xl shadow-brand-indigo/10"
          : "border-brand-slate-200 hover:border-brand-slate-300"
      }`}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: shouldReduce ? 0.1 : 0.45, delay: shouldReduce ? 0 : index * 0.09 }}
      whileHover={shouldReduce ? {} : { y: -5, boxShadow: model.highlight ? "0 28px 60px -15px rgba(79,70,229,0.18)" : "0 20px 50px -12px rgba(9,13,26,0.12)" }}
    >
      {model.highlight && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-violet" aria-hidden="true" />
      )}
      {model.highlight && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-indigo text-white text-[9px] font-mono uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
          Most Comprehensive
        </span>
      )}

      {/* Header gradient band */}
      <div className={`p-6 bg-gradient-to-br ${model.gradient} border-b border-brand-slate-200/60`}>
        <div className="space-y-3">
          <h3 className="text-lg font-extrabold text-brand-navy tracking-tight">{model.name}</h3>
          <p className="text-xs text-brand-slate-600 leading-relaxed">{model.tagline}</p>
        </div>

        <div className="mt-5 space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-brand-navy tracking-tight">{model.price}</span>
            <span className="text-xs text-brand-slate-500 font-semibold">{model.priceNote}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-slate-400" aria-hidden="true" />
              <span className="text-[10px] text-brand-slate-500 font-mono">{model.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-brand-slate-400" aria-hidden="true" />
              <span className="text-[10px] text-brand-slate-500 font-mono">{model.support}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 space-y-5">
        {/* Ideal for */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            Ideal For
          </span>
          <p className="text-xs text-brand-slate-600 leading-relaxed">{model.idealFor}</p>
        </div>

        {/* Outcomes */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            Expected Outcomes
          </span>
          <div className="space-y-1.5">
            {model.outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs text-brand-slate-600 leading-relaxed">{outcome}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">
            Deliverables
          </span>
          <div className="space-y-1.5">
            {model.deliverables.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <Check className="w-3 h-3 text-brand-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs text-brand-slate-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 border-t border-brand-slate-100">
        <motion.button
          onClick={onSelect}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue ${
            model.highlight
              ? "bg-brand-indigo hover:bg-brand-violet text-white"
              : "bg-brand-navy hover:bg-brand-blue text-white"
          }`}
          whileHover={shouldReduce ? {} : { scale: 1.02 }}
          whileTap={shouldReduce ? {} : { scale: 0.97 }}
          aria-label={`Book a consultation for ${model.name}`}
        >
          {model.cta}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.article>
  );
});

export default EngagementCard;
