import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduce ? 0 : -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0" aria-hidden="true">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-brand-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-brand-slate-400 rounded-full"
            animate={shouldReduce ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">LeadFlow is typing...</span>
      </div>
    </motion.div>
  );
}
