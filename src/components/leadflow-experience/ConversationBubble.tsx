import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bot, User } from "lucide-react";

interface ConversationBubbleProps {
  role: "visitor" | "leadflow";
  content: string;
  delay?: number;
  key?: string;
}

export default function ConversationBubble({ role, content, delay = 0 }: ConversationBubbleProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={`flex gap-3 ${role === "visitor" ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduce ? 0.15 : 0.35, delay: shouldReduce ? 0 : delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          role === "leadflow" ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-slate-200 text-brand-slate-600"
        }`}
        aria-hidden="true"
      >
        {role === "leadflow" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <motion.div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
          role === "leadflow"
            ? "bg-brand-slate-100 text-brand-navy rounded-tl-sm"
            : "bg-brand-navy text-white rounded-tr-sm"
        }`}
        initial={{ scale: shouldReduce ? 1 : 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: shouldReduce ? 0.1 : 0.2, delay: shouldReduce ? 0 : delay + 0.1 }}
      >
        {content}
      </motion.div>
    </motion.div>
  );
}
