import React, { useEffect, useState, useRef, memo } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";
import { TrendingUp, Clock, UserCheck, DollarSign, Repeat2, Headphones } from "lucide-react";

interface OutcomeMetric {
  icon: React.ElementType;
  before: string;
  after: string;
  afterNum: number;
  afterSuffix: string;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const metrics: OutcomeMetric[] = [
  {
    icon: TrendingUp, before: "3%", after: "34%", afterNum: 34, afterSuffix: "%",
    label: "Lead Conversion Rate",
    description: "From static form submissions to AI-qualified conversations.",
    iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
  },
  {
    icon: Clock, before: "14 hrs", after: "< 2min", afterNum: 2, afterSuffix: "min",
    label: "First Response Time",
    description: "LeadFlow engages the moment a visitor arrives — any hour.",
    iconBg: "bg-brand-blue/5", iconColor: "text-brand-blue",
  },
  {
    icon: UserCheck, before: "22%", after: "68%", afterNum: 68, afterSuffix: "%",
    label: "Qualified Booking Rate",
    description: "More website visitors become booked, high-intent appointments.",
    iconBg: "bg-violet-50", iconColor: "text-violet-600",
  },
  {
    icon: DollarSign, before: "$0", after: "$124K", afterNum: 124, afterSuffix: "K",
    label: "Additional Monthly Pipeline",
    description: "First 30-day pipeline result from a single client deployment.",
    iconBg: "bg-amber-50", iconColor: "text-amber-600",
  },
  {
    icon: Repeat2, before: "31%", after: "2%", afterNum: 2, afterSuffix: "%",
    label: "Missed Opportunity Rate",
    description: "Down from nearly 1-in-3 leads lost to nearly zero.",
    iconBg: "bg-rose-50", iconColor: "text-rose-500",
  },
  {
    icon: Headphones, before: "20 hrs", after: "2 hrs", afterNum: 2, afterSuffix: "hrs",
    label: "Weekly Admin Overhead",
    description: "Automation handles scheduling, follow-up, and data entry.",
    iconBg: "bg-teal-50", iconColor: "text-teal-600",
  },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    if (shouldReduce) { setCount(target); return; }
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setCount(Math.round(eased * target));
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, shouldReduce]);

  return (
    <div ref={ref} className="inline">
      {count}{suffix}
    </div>
  );
}

const BusinessOutcomes = memo(function BusinessOutcomes() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.article
            key={metric.label}
            className="bg-white border border-brand-slate-200 rounded-2xl p-5 group hover:border-brand-blue/20 transition-colors"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.07 }}
            whileHover={shouldReduce ? {} : { y: -4 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${metric.iconBg} ${metric.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-right">
                <span className="text-xs text-brand-slate-400 line-through block">{metric.before}</span>
                <span className="text-2xl font-black font-mono text-brand-navy">
                  <AnimatedNumber target={metric.afterNum} suffix={metric.afterSuffix} />
                </span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-brand-navy mb-1.5">{metric.label}</h4>
            <p className="text-xs text-brand-slate-500 leading-relaxed">{metric.description}</p>
          </motion.article>
        );
      })}
    </div>
  );
});

export default BusinessOutcomes;
