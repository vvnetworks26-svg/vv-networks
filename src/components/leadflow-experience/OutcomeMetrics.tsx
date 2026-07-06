import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TrendingUp, Clock, Calendar, PhoneOff } from "lucide-react";

interface MetricProps {
  icon: React.ElementType;
  before: string;
  after: string;
  label: string;
  delay: number;
  key?: string;
}

function SingleMetric({ icon: Icon, before, after, label, delay }: MetricProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="p-5 bg-white border border-brand-slate-200 rounded-2xl flex flex-col gap-4 group hover:border-brand-blue/20 transition-colors"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduce ? 0.1 : 0.45, delay: shouldReduce ? 0 : delay }}
      whileHover={shouldReduce ? {} : { y: -3 }}
    >
      <div className="w-10 h-10 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-slate-400 line-through">{before}</span>
          <span className="text-xs text-brand-slate-400" aria-hidden="true">→</span>
          <motion.span
            className="text-lg font-black text-brand-navy"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: shouldReduce ? 0 : delay + 0.3 }}
          >
            {after}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

export default function OutcomeMetrics() {
  const metrics = [
    { icon: TrendingUp, before: "8.4%",   after: "34.2%", label: "Lead Conversion Rate",      delay: 0 },
    { icon: Clock,      before: "14 hrs",  after: "< 2min", label: "First Response Time",     delay: 0.1 },
    { icon: Calendar,   before: "22%",     after: "68%",   label: "Booking Rate from Traffic", delay: 0.2 },
    { icon: PhoneOff,   before: "31%",     after: "2%",    label: "Missed Opportunity Rate",   delay: 0.3 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {metrics.map((m) => (
        <SingleMetric key={m.label} {...m} />
      ))}
    </div>
  );
}
