import React, { useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown, Package, Clock, CheckCircle2 } from "lucide-react";
import { nextSteps } from "./contactData";

const NextStepTimeline = memo(function NextStepTimeline() {
  const shouldReduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(0);

  return (
    <div className="space-y-3" role="list">
      {/* Desktop connector */}
      <div className="hidden lg:flex items-center justify-between mb-10 relative px-8">
        <div className="absolute left-8 right-8 top-5 h-0.5 bg-brand-slate-200 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-blue via-amber-500 to-teal-500 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.05 : 1.5, ease: "easeOut", delay: shouldReduce ? 0 : 0.2 }}
          />
        </div>
        {nextSteps.map((step, i) => (
          <motion.button
            key={step.step}
            onClick={() => setActive(active === i ? null : i)}
            className="relative z-10 flex flex-col items-center gap-2 focus-visible:outline-2 focus-visible:outline-brand-blue rounded-xl p-1"
            aria-pressed={active === i}
            aria-label={`${step.title} — ${step.duration}`}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.3, delay: shouldReduce ? 0 : i * 0.07 }}
          >
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black font-mono text-white shadow-sm ${step.color} ${active === i ? "ring-2 ring-offset-2 ring-current" : ""}`}
              whileHover={shouldReduce ? {} : { scale: 1.12 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {step.step}
            </motion.div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${active === i ? "text-brand-navy" : "text-brand-slate-400"}`}>
              {step.title}
            </span>
          </motion.button>
        ))}
      </div>

      {nextSteps.map((step, i) => {
        const isOpen = active === i;
        return (
          <motion.div
            key={step.step}
            className="border border-brand-slate-200 rounded-2xl overflow-hidden bg-white"
            role="listitem"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.35, delay: shouldReduce ? 0 : i * 0.05 }}
          >
            <button
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue ${isOpen ? "bg-brand-slate-50/60" : "hover:bg-brand-slate-50/40"}`}
              onClick={() => setActive(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`step-detail-${i}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono text-white flex-shrink-0 ${step.color}`} aria-hidden="true">
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-brand-navy block">{step.title}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-brand-slate-400" aria-hidden="true" />
                  <span className="text-[10px] text-brand-slate-400 font-mono">{step.duration}</span>
                </div>
              </div>
              <motion.div animate={shouldReduce ? {} : { rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} aria-hidden="true">
                <ChevronDown className="w-4 h-4 text-brand-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`step-detail-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduce ? 0.1 : 0.26, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-4 border-t border-brand-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-brand-blue" aria-hidden="true" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold">Deliverables</span>
                      </div>
                      <ul className="space-y-1.5">
                        {step.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span className="text-xs text-brand-slate-600">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block">Expected Outcome</span>
                      <p className="text-xs text-brand-slate-600 leading-relaxed">{step.outcome}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
});

export default NextStepTimeline;
