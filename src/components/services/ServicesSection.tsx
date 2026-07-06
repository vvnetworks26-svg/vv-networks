import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import ProblemCard from "./ProblemCard";
import SolutionCard from "./SolutionCard";
import IndustryCard from "./IndustryCard";
import TechnologyEcosystem from "./TechnologyEcosystem";
import ImplementationTimeline from "./ImplementationTimeline";
import BusinessOutcomes from "./BusinessOutcomes";
import { businessProblems, solutions, industries } from "./solutionsData";

interface ServicesSectionProps {
  onBookDemo: () => void;
  onOpenChat: () => void;
}

const ServicesSection = memo(function ServicesSection({ onBookDemo, onOpenChat }: ServicesSectionProps) {
  const shouldReduce = useReducedMotion();

  return (
    <>
      {/* ══════════════════════════════════════════
          SERVICES / SOLUTIONS SECTION
      ══════════════════════════════════════════ */}
      <section id="services" className="py-20 sm:py-32 max-w-7xl mx-auto px-6 sm:px-8 space-y-24">

        {/* ── Section header ── */}
        <ScrollReveal>
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              Business Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy">
              We don't sell websites.<br />
              <span className="text-brand-slate-400">We solve business problems.</span>
            </h2>
            <p className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-xl">
              We build systems that help businesses generate more qualified leads, automate repetitive work, and scale operations — without adding headcount.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Business Problems ── */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Common Bottlenecks
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Which of these is costing<br />
                <span className="text-brand-slate-400">your business right now?</span>
              </h3>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businessProblems.map((problem, index) => (
              <ProblemCard key={problem.id} problem={problem} index={index} />
            ))}
          </div>
        </div>

        {/* ── Solutions ── */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Our Solutions
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Four ways we transform<br />
                <span className="text-brand-slate-400">the way your business operates.</span>
              </h3>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <SolutionCard
                key={solution.id}
                solution={solution}
                index={index}
                onBookDemo={onBookDemo}
              />
            ))}
          </div>
        </div>

        {/* ── Industry Solutions ── */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Industry Solutions
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Built for your industry.<br />
                <span className="text-brand-slate-400">Tuned to your workflow.</span>
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg">
                Every industry has unique operational constraints. We don't apply generic templates — we study your workflow and engineer around it.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <IndustryCard
                key={industry.id}
                industry={industry}
                index={index}
                onBookDemo={onBookDemo}
              />
            ))}
          </div>
        </div>

        {/* ── Technology Ecosystem ── */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="max-w-2xl space-y-2 text-center mx-auto">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Engineering Ecosystem
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                The tools behind the systems we build.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed">
                Every technology choice is deliberate — selected for performance, security, and long-term maintainability.
              </p>
            </div>
          </ScrollReveal>
          <TechnologyEcosystem />
        </div>

        {/* ── Implementation Journey ── */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="max-w-2xl space-y-2 text-center mx-auto">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                How We Work
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                From first call to live system.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed">
                A disciplined seven-phase process that eliminates scope drift and delivers on schedule. Click any step to see what happens.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-brand-slate-50/60 border border-brand-slate-200 rounded-3xl p-6 sm:p-10">
              <ImplementationTimeline />
            </div>
          </ScrollReveal>
        </div>

        {/* ── Business Outcomes ── */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="max-w-2xl space-y-2 text-center mx-auto">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Measurable Impact
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Real numbers from real deployments.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed">
                Every metric below is drawn from actual client outcomes after deploying LeadFlow or custom software solutions.
              </p>
            </div>
          </ScrollReveal>
          <BusinessOutcomes />
        </div>

      </section>

      {/* ── Services CTA ── */}
      <section className="py-12 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal>
          <div className="relative bg-brand-navy rounded-[32px] p-8 sm:p-16 text-center overflow-hidden space-y-6">
            {/* Dot pattern */}
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" aria-hidden="true" />

            {/* Ambient glow */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-indigo/20 rounded-full pointer-events-none"
              style={{ filter: "blur(90px)" }}
              animate={shouldReduce ? {} : { scale: [1, 1.12, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-6">
              <motion.div
                className="inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border border-white/10"
                animate={shouldReduce ? {} : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
                Accepting New Partners
              </motion.div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white max-w-2xl mx-auto">
                Ready to build your competitive advantage?
              </h2>

              <p className="text-sm text-brand-slate-300 leading-relaxed max-w-md mx-auto">
                Book a 15-minute strategy call. We'll map the exact systems that would have the biggest impact on your business — and what it takes to build them.
              </p>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <motion.button
                  onClick={onBookDemo}
                  className="relative overflow-hidden px-6 py-3.5 rounded-full bg-white text-brand-navy text-xs font-bold flex items-center gap-1.5 hover:bg-brand-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="Book a strategy call"
                >
                  Book Strategy Call
                  <ArrowRight className="w-4 h-4 text-brand-indigo" aria-hidden="true" />
                </motion.button>
                <motion.button
                  onClick={onOpenChat}
                  className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="Explore LeadFlow live"
                >
                  Explore LeadFlow Live
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
});

export default ServicesSection;
