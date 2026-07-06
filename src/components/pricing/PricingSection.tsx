import React, { useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles, Shield, Ban, ChevronDown, Plus, Minus } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import EngagementCard from "./EngagementCard";
import ComparisonMatrix from "./ComparisonMatrix";
import IncludedCard from "./IncludedCard";
import TimelinePricing from "./TimelinePricing";
import { engagementModels, includedItems, pricingFaqs } from "./pricingData";

interface PricingSectionProps {
  onBookDemo: () => void;
  onOpenChat: () => void;
}

const PricingSection = memo(function PricingSection({ onBookDemo, onOpenChat }: PricingSectionProps) {
  const shouldReduce = useReducedMotion();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <>
      <section id="pricing" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-24">

          {/* Header */}
          <ScrollReveal>
            <div className="max-w-3xl space-y-4 text-center mx-auto">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Engagement Models & Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy">
                Choose the partnership<br/>
                <span className="text-brand-slate-400">that fits your business.</span>
              </h2>
              <p className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-xl mx-auto">
                Every business has unique requirements. Our pricing reflects value delivered — not arbitrary feature limits or hidden costs.
              </p>
            </div>
          </ScrollReveal>

          {/* Why we don't sell packages */}
          <ScrollReveal delay={0.1}>
            <div className="bg-brand-slate-50/60 border border-brand-slate-200 rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-11 h-11 rounded-xl bg-white border border-brand-slate-200 flex items-center justify-center text-brand-blue flex-shrink-0">
                  <Shield className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-brand-navy">Why we don't sell cookie-cutter packages</h3>
                  <div className="space-y-2 text-xs text-brand-slate-600 leading-relaxed">
                    <p>We don't upsell features you don't need. We don't gate basic capabilities to force you into higher tiers. We don't hide costs behind setup fees or integration charges.</p>
                    <p>Every recommendation we make is based on your business goals — not our pricing structure.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {[
                      { icon: Ban, text: "No unnecessary upsells" },
                      { icon: Ban, text: "No hidden fees" },
                      { icon: Ban, text: "No feature gating" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-1.5">
                        <item.icon className="w-3 h-3 text-rose-500" aria-hidden="true" />
                        <span className="text-[10px] font-semibold text-brand-slate-500">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Engagement models */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Four Engagement Models
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  From AI deployment<br/>
                  <span className="text-brand-slate-400">to long-term partnership.</span>
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

          {/* Comparison matrix */}
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
                  A transparent breakdown of process, support, and capabilities across all four models.
                </p>
              </div>
            </ScrollReveal>
            <ComparisonMatrix />
          </div>

          {/* What's included */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Standard in Every Project
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  These aren't add-ons.<br/>
                  <span className="text-brand-slate-400">They're part of the process.</span>
                </h3>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {includedItems.map((item, index) => (
                <IncludedCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Typical Project Flow
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  From first call to live system.
                </h3>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="bg-brand-slate-50/60 border border-brand-slate-200 rounded-3xl p-8 sm:p-12">
                <TimelinePricing />
              </div>
            </ScrollReveal>
          </div>

          {/* FAQ */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="text-center space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Pricing FAQ
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                  Common questions about<br/>
                  <span className="text-brand-slate-400">how we work.</span>
                </h3>
              </div>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto space-y-3">
              {pricingFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <ScrollReveal key={index} delay={index * 0.05}>
                    <div className="bg-white border border-brand-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-brand-navy hover:text-brand-blue transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
                        aria-expanded={isExpanded}
                        aria-controls={`pricing-faq-${index}`}
                      >
                        <span>{faq.q}</span>
                        <motion.div
                          animate={shouldReduce ? {} : { rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 ml-4"
                          aria-hidden="true"
                        >
                          {isExpanded ? <Minus className="w-4 h-4 text-brand-blue" /> : <Plus className="w-4 h-4 text-brand-slate-400" />}
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            id={`pricing-faq-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: shouldReduce ? 0.1 : 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-6 pb-4 text-xs text-brand-slate-500 leading-relaxed border-t border-brand-slate-100 pt-4">
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

      {/* Final CTA */}
      <section className="py-12 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal>
          <div className="relative bg-brand-navy rounded-[32px] p-8 sm:p-16 text-center overflow-hidden space-y-6">
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" aria-hidden="true" />

            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-violet/25 rounded-full pointer-events-none"
              style={{ filter: "blur(100px)" }}
              animate={shouldReduce ? {} : { scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-6">
              <motion.div
                className="inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border border-white/10"
                animate={shouldReduce ? {} : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
                No Contracts. No Lock-In.
              </motion.div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white max-w-2xl mx-auto">
                Let's build something your competitors can't.
              </h2>

              <p className="text-sm text-brand-slate-300 leading-relaxed max-w-md mx-auto">
                Book a 15-minute strategy session. We'll identify the exact system that would transform your operations — and outline what it takes to build it.
              </p>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <motion.button
                  onClick={onBookDemo}
                  className="px-6 py-3.5 rounded-full bg-white text-brand-navy text-xs font-bold flex items-center gap-1.5 hover:bg-brand-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="Book strategy session"
                >
                  Book Strategy Session
                  <ArrowRight className="w-4 h-4 text-brand-indigo" aria-hidden="true" />
                </motion.button>
                <motion.button
                  onClick={onOpenChat}
                  className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="Talk about LeadFlow"
                >
                  Talk About LeadFlow
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
