import React, { useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowRight, Sparkles, X, Check, Plus, Minus,
  ShieldCheck, Zap,
} from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import EngagementCard from "./EngagementCard";
import ComparisonMatrix from "./ComparisonMatrix";
import IncludedCard from "./IncludedCard";
import JourneyTimeline from "./JourneyTimeline";
import { engagementModels, includedItems, pricingFaqs } from "./pricingData";

interface PricingSectionProps {
  onBookDemo: () => void;
  onOpenChat: () => void;
}

/* ── Why We Don't Sell Packages — split comparison ── */
const agencyItems = [
  "Generic templates and theme builders",
  "Hidden costs and integration fees",
  "Arbitrary feature limits per tier",
  "Pressure to upgrade for basics",
  "Disappear after delivery",
];

const vvItems = [
  "Business-first strategy every time",
  "Transparent, milestone-based pricing",
  "Custom implementation for your workflow",
  "Recommendations based on your goals",
  "Long-term partnership beyond launch",
];

/* ── Pricing Philosophy panel ── */
function PricingPhilosophy({ onBookDemo }: { onBookDemo: () => void }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="relative bg-brand-navy rounded-3xl p-8 sm:p-12 overflow-hidden"
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduce ? 0.1 : 0.5 }}
    >
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" aria-hidden="true" />
      <motion.div
        className="absolute -top-24 -right-24 w-64 h-64 bg-brand-violet/30 rounded-full pointer-events-none"
        style={{ filter: "blur(80px)" }}
        animate={shouldReduce ? {} : { scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80">
              Pricing Philosophy
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            We price based on the value we create — not arbitrary feature limits.
          </h3>
          <div className="space-y-3 text-sm text-brand-slate-300 leading-relaxed">
            <p>
              Software that genuinely transforms a business operation should be priced to reflect the revenue it unlocks, the hours it saves, and the compounding advantage it creates — not the number of users or API calls.
            </p>
            <p>
              We don't publish rigid price lists because two businesses with the same problem often need fundamentally different solutions. The right number comes from understanding your workflow, your goals, and the impact of solving the problem correctly.
            </p>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-4">
          {[
            { icon: Zap, text: "Scoped to your actual requirements" },
            { icon: Check, text: "Milestone-based — pay as value is delivered" },
            { icon: ShieldCheck, text: "No hidden fees or surprise charges" },
            { icon: ArrowRight, text: "Every conversation is obligation-free" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
              </div>
              <span className="text-sm text-white/80 font-medium">{text}</span>
            </div>
          ))}
          <motion.button
            onClick={onBookDemo}
            className="mt-6 w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-brand-navy text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-brand-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-white"
            whileHover={shouldReduce ? {} : { y: -2 }}
            whileTap={shouldReduce ? {} : { scale: 0.97 }}
            aria-label="Start a discovery conversation"
          >
            Start a Discovery Conversation
            <ArrowRight className="w-3.5 h-3.5 text-brand-indigo" aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

const PricingSection = memo(function PricingSection({ onBookDemo, onOpenChat }: PricingSectionProps) {
  const shouldReduce = useReducedMotion();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <>
      <section id="pricing" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-24">

          {/* ── 1. Section Hero ── */}
          <ScrollReveal>
            <div className="max-w-3xl space-y-5 mx-auto text-center">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Engagement Models
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-navy leading-tight">
                Choose the partnership<br />
                <span className="text-brand-slate-400">that fits your business.</span>
              </h2>
              <p className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-xl mx-auto">
                Every business has different goals. Instead of forcing everyone into rigid packages, we recommend the engagement model that delivers the highest business impact for your specific situation.
              </p>
            </div>
          </ScrollReveal>

          {/* ── 2. Why We Don't Sell Packages ── */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Our Approach
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  Why we don't sell cookie-cutter packages.
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {/* Traditional agencies */}
                <div className="p-6 bg-brand-slate-50/60 border border-brand-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                      <X className="w-4 h-4 text-rose-500" aria-hidden="true" />
                    </div>
                    <h4 className="text-sm font-bold text-brand-slate-600">Traditional Agencies</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {agencyItems.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <X className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span className="text-xs text-brand-slate-500">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* VV Networks */}
                <div className="p-6 bg-white border border-brand-blue/20 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-blue/8 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-brand-blue" aria-hidden="true" />
                    </div>
                    <h4 className="text-sm font-bold text-brand-navy">VV Networks</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {vvItems.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-brand-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span className="text-xs text-brand-slate-600 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── 3. Engagement Models ── */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Four Engagement Models
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  From AI deployment<br />
                  <span className="text-brand-slate-400">to long-term technology partnership.</span>
                </h3>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {engagementModels.map((model, index) => (
                <EngagementCard
                  key={model.id}
                  model={model}
                  index={index}
                  onSelect={onBookDemo}
                />
              ))}
            </div>
          </div>

          {/* ── 4. Comparison Matrix ── */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Detailed Comparison
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  What's included in each engagement.
                </h3>
                <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
                  A transparent breakdown of every feature, deliverable, and capability across all four models.
                </p>
              </div>
            </ScrollReveal>
            <ComparisonMatrix />
          </div>

          {/* ── 5. Client Journey Timeline ── */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Client Journey
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  Exactly what working together looks like.
                </h3>
                <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
                  Click any step to see what we deliver, how long it takes, and what outcome to expect.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="bg-brand-slate-50/60 border border-brand-slate-200 rounded-3xl p-6 sm:p-10">
                <JourneyTimeline />
              </div>
            </ScrollReveal>
          </div>

          {/* ── 6. Every Client Receives ── */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Standard on Every Project
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  These aren't add-ons.<br />
                  <span className="text-brand-slate-400">Every client receives them.</span>
                </h3>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {includedItems.map((item, index) => (
                <IncludedCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>

          {/* ── 7. Pricing Philosophy ── */}
          <ScrollReveal delay={0.1}>
            <PricingPhilosophy onBookDemo={onBookDemo} />
          </ScrollReveal>

          {/* ── 8. FAQ ── */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Common Questions
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  Everything you want to know<br />
                  <span className="text-brand-slate-400">before you reach out.</span>
                </h3>
              </div>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto space-y-3">
              {pricingFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <ScrollReveal key={index} delay={index * 0.04}>
                    <div className="bg-white border border-brand-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-brand-navy hover:text-brand-blue transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
                        aria-expanded={isExpanded}
                        aria-controls={`pricing-faq-${index}`}
                        id={`pricing-faq-btn-${index}`}
                      >
                        <span>{faq.q}</span>
                        <motion.div
                          animate={shouldReduce ? {} : { rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 ml-4"
                          aria-hidden="true"
                        >
                          {isExpanded
                            ? <Minus className="w-4 h-4 text-brand-blue" />
                            : <Plus className="w-4 h-4 text-brand-slate-400" />
                          }
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            id={`pricing-faq-${index}`}
                            role="region"
                            aria-labelledby={`pricing-faq-btn-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: shouldReduce ? 0.1 : 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 text-xs text-brand-slate-500 leading-relaxed border-t border-brand-slate-100 pt-4">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ── 9. Final CTA ── */}
      <section className="py-12 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal>
          <div className="relative bg-brand-navy rounded-[32px] p-8 sm:p-16 text-center overflow-hidden space-y-6">
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" aria-hidden="true" />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-brand-violet/25 rounded-full pointer-events-none"
              style={{ filter: "blur(100px)" }}
              animate={shouldReduce ? {} : { scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-6">
              <motion.div
                className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold"
                animate={shouldReduce ? {} : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
                No Contracts. No Lock-In. No Pressure.
              </motion.div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white max-w-2xl mx-auto">
                Let's build something your competitors can't.
              </h2>

              <p className="text-sm text-brand-slate-300 leading-relaxed max-w-lg mx-auto">
                Whether you're launching your first AI system or modernising your entire business, we'll help you build software that creates measurable, lasting business value.
              </p>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <motion.button
                  onClick={onBookDemo}
                  className="px-6 py-3.5 rounded-full bg-white text-brand-navy text-xs font-bold flex items-center gap-1.5 hover:bg-brand-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="Book a strategy session"
                >
                  Book Strategy Session
                  <ArrowRight className="w-4 h-4 text-brand-indigo" aria-hidden="true" />
                </motion.button>
                <motion.button
                  onClick={onOpenChat}
                  className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="Explore LeadFlow live"
                >
                  Explore LeadFlow
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
});

export default PricingSection;
