import React, { memo } from "react";
import { motion } from "motion/react";
import { ArrowRight, Home } from "lucide-react";

const NotFound = memo(function NotFound() {
  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6 py-24 space-y-8"
      role="main"
      aria-label="Page not found"
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue/5 rounded-full pointer-events-none"
        style={{ filter: "blur(80px)" }}
        aria-hidden="true"
      />

      <div className="relative space-y-6 max-w-lg">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-black text-2xl mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          V
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-brand-blue font-bold block">
            404 — Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            This page doesn't exist.
          </h1>
          <p className="text-sm text-brand-slate-500 leading-relaxed">
            The page you're looking for may have moved or never existed. Head back to the homepage or get in touch.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <a
            href="/"
            className="px-6 py-3 rounded-full bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            Back to Home
          </a>
          <a
            href="/#contact"
            className="px-6 py-3 rounded-full border border-brand-slate-200 hover:border-brand-blue/30 text-brand-slate-700 hover:text-brand-navy text-xs font-bold transition-all flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-brand-blue"
          >
            Contact Us
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </div>
  );
});

export default NotFound;
