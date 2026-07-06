import React, { useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown, Lightbulb, Target, CheckCircle2 } from "lucide-react";
import { thinkingSteps } from "./companyData";

const ThinkingTimeline = memo(function ThinkingTimeline() {
  const shouldReduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState<number | null>(0);

  return (
    <div className="space-y-3" role="list">
      {/* Desktop gradient connector */}
      <div className="hidden lg:flex items-center justify-between mb-10 relative px-8">
        <div className="absolute left-8 right-8 top-5 h-0.5 bg-brand-slate-200 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-blue via-brand-violet to-emerald-500 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.05 : 1.5, ease: "easeOut", delay: shouldReduce ? 0 : 0.3 }}
          />
        </div>
        {thinkingSteps.map((step, i) => (
          <motion.button
            key={step.step}
            onClick={() => setActiveStep(activeStep === i ? null : i)}
            className="relative z-10 flex flex-col items-center gap-2 focus-visible:outline-2 focus-visible:outline-brand-blue rounded-xl p-1"
            aria-pressed={activeStep === i}
            aria-label={step.title}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.35, delay: shouldReduce ? 0 : i * 0.08 }}
          >
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black font-mono text-white shadow-sm ${step.color} ${
                activeStep === i ? "ring-2 ring-offset-2 ring-current" : ""
              }`}
              whileHover={shouldReduce ? {} : { scale: 1.12 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {step.step}
            </motion.div>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
              activeStep === i ? "text-brand-navy" : "text-brand-slate-400"
            }`}>
              {step.title}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Step cards */}
      {thinkingSteps.map((step, i) => {
        const isOpen = activeStep === i;
        return (
          <motion.div
            key={step.step}
            className="border border-brand-slate-200 rounded-2xl overflow-hidden bg-white"
            role="listitem"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.38, delay: shouldReduce ? 0 : i * 0.05 }}
          >
            <button
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue ${
                isOpen ? "bg-brand-slate-50/60" : "hover:bg-brand-slate-50/40"
              }`}
              onClick={() => setActiveStep(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`thinking-${i}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono text-white flex-shrink-0 ${step.color}`}
                aria-hidden="true"
              >
                {step.step}
              </div>
              <span className="flex-1 text-sm font-bold text-brand-navy">{step.title}</span>
              <motion.div
                animate={shouldReduce ? {} : { rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              >
                <ChevronDown className="w-4 h-4 text-brand-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`thinking-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduce ? 0.1 : 0.28, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-4 border-t border-brand-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="w-3 h-3 text-brand-blue" aria-hidden="true" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold">What happens</span>
                      </div>
                      <p className="text-xs text-brand-slate-600 leading-relaxed">{step.what}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-brand-indigo" aria-hidden="true" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold">Why it matters</span>
                      </div>
                      <p className="text-xs text-brand-slate-600 leading-relaxed">{step.why}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold">Client outcome</span>
                      </div>
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

export default ThinkingTimeline;
