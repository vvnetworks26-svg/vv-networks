import React, { memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MessageSquare, X } from "lucide-react";
import { useLeadFlow } from "./LeadFlowContext";

const WidgetLauncher = memo(function WidgetLauncher() {
  const shouldReduce = useReducedMotion();
  const { isOpen, hasUnread, toggleWidget, config } = useLeadFlow();

  return (
    <motion.button
      onClick={toggleWidget}
      className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-brand-blue via-brand-indigo to-brand-violet text-white flex items-center justify-center shadow-2xl z-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-indigo"
      whileHover={shouldReduce ? {} : { scale: 1.07 }}
      whileTap={shouldReduce ? {} : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      aria-label={isOpen ? "Close LeadFlow chat" : config.launcherLabel}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: shouldReduce ? 0 : -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: shouldReduce ? 0 : 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden="true"
          >
            <X className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: shouldReduce ? 0 : 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: shouldReduce ? 0 : -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden="true"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unread badge */}
      {hasUnread && !isOpen && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5" aria-label="New message">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-violet opacity-75" />
          <span className="relative inline-flex rounded-full h-5 w-5 bg-brand-violet items-center justify-center text-[10px] font-bold text-white">
            1
          </span>
        </span>
      )}
    </motion.button>
  );
});

export default WidgetLauncher;
