import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Zap, Shield, Gauge, Accessibility, GitBranch, Sparkles } from "lucide-react";

const principles = [
  {
    icon: Zap,
    title: "Performance First",
    desc: "Every line of code is optimized for speed. We target sub-second load times and measure real user metrics obsessively.",
  },
  {
    icon: Shield,
    title: "Security by Design",
    desc: "Input validation, parameterized queries, encrypted pipelines, and SOC2-ready infrastructure as baseline standards — not afterthoughts.",
  },
  {
    icon: Gauge,
    title: "Scalable Architecture",
    desc: "Systems architected to handle 10× growth from day one. Auto-scaling infrastructure, optimized database indexes, and efficient caching layers.",
  },
  {
    icon: Accessibility,
    title: "Accessible by Default",
    desc: "WCAG 2.1 AA compliance, keyboard navigation, ARIA labels, and screen reader support built into every component we ship.",
  },
  {
    icon: GitBranch,
    title: "Maintainability",
    desc: "Clean code architecture, strict TypeScript, comprehensive tests, and documentation that engineering teams actually use.",
  },
  {
    icon: Sparkles,
    title: "Modern Development",
    desc: "React Server Components, edge functions, WebSockets for real-time, and CI/CD pipelines that deploy in under 90 seconds.",
  },
];

export default function EngineeringPrinciples() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {principles.map((principle, index) => {
        const Icon = principle.icon;
        return (
          <motion.article
            key={principle.title}
            className="p-6 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduce ? 0.1 : 0.45, delay: shouldReduce ? 0 : index * 0.07 }}
            whileHover={shouldReduce ? {} : { y: -4 }}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <h4 className="text-sm font-bold text-brand-navy mb-2">{principle.title}</h4>
            <p className="text-xs text-brand-slate-500 leading-relaxed">{principle.desc}</p>
          </motion.article>
        );
      })}
    </div>
  );
}
