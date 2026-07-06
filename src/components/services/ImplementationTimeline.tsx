import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { implementationPhases } from "./solutionsData";

export default function ImplementationTimeline() {
  const shouldReduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const active = implementationPhases[activeStep];

  return (
    <div className="space-y-8">
      {/* Animated connector line */}
      <div className="hidden md:block relative">
        <div className="absolute top-6 left-[calc(100%/14)] right-[calc(100%/14)] h-0.5 bg-brand-slate-200 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-blue to-brand-violet origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.05 : 1.4, ease: "easeOut", delay: shouldReduce ? 0 : 0.3 }}
          />
        </div>

        {/* Step buttons */}
        <div className="relative flex justify-between">
          {implementationPhases.map((phase, index) => (
            <motion.button
              key={phase.step}
              onClick={() => setActiveStep(index)}
              className={`flex flex-col items-center gap-2 group focus-visible:outline-2 focus-visible:outline-brand-blue rounded-xl p-1`}
              aria-pressed={activeStep === index}
              aria-label={`${phase.title}: ${phase.duration}`}
              initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduce ? 0.1 : 0.35, delay: shouldReduce ? 0 : index * 0.08 }}
            >
              <motion.div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-black font-mono z-10 relative bg-white shadow-sm transition-colors duration-200 ${
                  activeStep === index
                    ? "border-brand-blue text-brand-blue shadow-brand-blue/20 shadow-md"
                    : index < activeStep
                    ? "border-brand-indigo bg-brand-indigo/5 text-brand-indigo"
                    : "border-brand-slate-300 text-brand-slate-400 group-hover:border-brand-blue/50 group-hover:text-brand-blue"
                }`}
                whileHover={shouldReduce ? {} : { scale: 1.1 }}
                whileTap={shouldReduce ? {} : { scale: 0.95 }}
                animate={
                  activeStep === index && !shouldReduce
                    ? { boxShadow: ["0 0 0 0 rgba(37,99,235,0)", "0 0 0 8px rgba(37,99,235,0.1)", "0 0 0 0 rgba(37,99,235,0)"] }
                    : {}
                }
                transition={{ duration: 2, repeat: activeStep === index ? Infinity : 0 }}
              >
                {phase.step}
              </motion.div>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider transition-colors ${
                activeStep === index ? "text-brand-blue" : "text-brand-slate-400 group-hover:text-brand-navy"
              }`}>
                {phase.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden space-y-3">
        {implementationPhases.map((phase, index) => (
          <button
            key={phase.step}
            onClick={() => setActiveStep(index)}
            className={`w-full text-left p-4 rounded-xl border transition-all focus-visible:outline-2 focus-visible:outline-brand-blue ${
              activeStep === index
                ? "bg-white border-brand-blue shadow-sm"
                : "bg-white/60 border-brand-slate-200 hover:border-brand-slate-300"
            }`}
            aria-pressed={activeStep === index}
          >
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black font-mono w-6 ${activeStep === index ? "text-brand-blue" : "text-brand-slate-400"}`}>
                {phase.step}
              </span>
              <span className={`text-xs font-bold ${activeStep === index ? "text-brand-navy" : "text-brand-slate-600"}`}>
                {phase.title}
              </span>
              <span className="text-[10px] text-brand-slate-400 ml-auto">{phase.duration}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active step detail card */}
      <motion.div
        key={active.step}
        className="bg-white border border-brand-blue/20 rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-4 items-start"
        initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduce ? 0.1 : 0.3 }}
      >
        <div className="sm:col-span-2">
          <span className="text-4xl font-black font-mono text-brand-slate-100">{active.step}</span>
        </div>
        <div className="sm:col-span-7 space-y-2">
          <h4 className="text-base font-extrabold text-brand-navy">{active.title}</h4>
          <p className="text-sm text-brand-slate-500 leading-relaxed">{active.description}</p>
        </div>
        <div className="sm:col-span-3 sm:text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 block">Timeline</span>
          <span className="text-sm font-bold text-brand-navy">{active.duration}</span>
        </div>
      </motion.div>
    </div>
  );
}
