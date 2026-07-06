import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";

const phases = [
  { step: "01", label: "Discovery",    sub: "3–5 days",   color: "bg-brand-blue"   },
  { step: "02", label: "Planning",     sub: "1 week",     color: "bg-brand-indigo" },
  { step: "03", label: "Development",  sub: "4–8 weeks",  color: "bg-brand-violet" },
  { step: "04", label: "Testing",      sub: "1 week",     color: "bg-violet-400"   },
  { step: "05", label: "Launch",       sub: "2–3 days",   color: "bg-emerald-500"  },
  { step: "06", label: "Optimization", sub: "Ongoing",    color: "bg-teal-500"     },
];

const TimelinePricing = memo(function TimelinePricing() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="hidden sm:block absolute top-5 left-[calc(100%/12)] right-[calc(100%/12)] h-0.5 bg-brand-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-blue via-brand-violet to-emerald-500 origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduce ? 0.05 : 1.5, ease: "easeOut", delay: shouldReduce ? 0 : 0.2 }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.step}
            className="flex flex-col items-center text-center gap-3"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.1 }}
          >
            <motion.div
              className={`w-10 h-10 rounded-full ${phase.color} text-white flex items-center justify-center text-xs font-black font-mono shadow-sm z-10 relative`}
              whileHover={shouldReduce ? {} : { scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {phase.step}
            </motion.div>
            <div>
              <span className="text-xs font-bold text-brand-navy block">{phase.label}</span>
              <span className="text-[10px] font-mono text-brand-slate-400 block">{phase.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export default TimelinePricing;
