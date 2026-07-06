import React, { useEffect, useRef, useState, memo } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";
import { businessMetrics } from "./companyData";

function AnimatedCounter({
  target,
  suffix,
  color,
}: {
  target: number;
  suffix: string;
  color: string;
}) {
  const [count, setCount] = useState(0);
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || target === 0) {
      setCount(target);
      return;
    }
    if (shouldReduce) {
      setCount(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setCount(Math.round(eased * target));
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target, shouldReduce]);

  return (
    <span ref={ref} className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${color}`}>
      {count}
      {suffix}
    </span>
  );
}

const MetricsSection = memo(function MetricsSection() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {businessMetrics.map((metric, index) => (
        <motion.article
          key={metric.id}
          className="p-6 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors text-center space-y-2"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduce ? 0.1 : 0.4, delay: shouldReduce ? 0 : index * 0.09 }}
          whileHover={shouldReduce ? {} : { y: -4 }}
        >
          {metric.suffix === "" && metric.value === "∞" ? (
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${metric.color}`}>
              ∞
            </span>
          ) : (
            <AnimatedCounter
              target={metric.numericTarget}
              suffix={metric.suffix}
              color={metric.color}
            />
          )}
          <p className="text-xs font-bold text-brand-navy">{metric.label}</p>
          <p className="text-[11px] text-brand-slate-400 leading-relaxed">{metric.explanation}</p>
        </motion.article>
      ))}
    </div>
  );
});

export default MetricsSection;
