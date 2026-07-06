import React, { useState, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles, Check, Plus, Minus } from "lucide-react";
import {
  Target, AlertCircle, TrendingUp, Cpu, Lightbulb, Map, Calendar, MessageCircle,
} from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import StaggerContainer, { StaggerItem } from "../StaggerContainer";
import BookingForm from "./BookingForm";
import ContactCard from "./ContactCard";
import NextStepTimeline from "./NextStepTimeline";
import { contactOptions, agendaItems, contactFaqs } from "./contactData";

const agendaIcons: Record<string, React.ElementType> = {
  goals: Target, challenges: AlertCircle, growth: TrendingUp,
  tech: Cpu, solution: Lightbulb, roadmap: Map,
  timeline: Calendar, questions: MessageCircle,
};

const bookingBenefits = [
  "Free 30-minute strategy session",
  "Business-first discussion — no technical jargon",
  "Specific, tailored recommendations",
  "Clear growth and automation opportunities",
  "Written proposal within 48 hours",
  "No obligation, no pressure",
];

interface ContactSectionProps {
  onOpenChat: () => void;
}

const ContactSection = memo(function ContactSection({ onOpenChat }: ContactSectionProps) {
  const shouldReduce = useReducedMotion();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <section id="contact" aria-label="Contact VV Networks">

      {/* ── 1. Contact Hero ── */}
      <div className="py-20 sm:py-32 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal>
          <div className="max-w-3xl space-y-5">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              Get in Touch
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-navy leading-tight">
              Let's talk about<br />
              <span className="text-brand-slate-400">your business.</span>
            </h2>
            <p className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-xl">
              Every successful software project starts with understanding the business behind it. Whether you're exploring AI, modern websites, or custom software — we'd love to hear what you're building.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              {[
                { val: "Free strategy session", color: "text-brand-blue" },
                { val: "Response within 24 hours", color: "text-brand-indigo" },
                { val: "No obligation", color: "text-emerald-600" },
              ].map(({ val, color }) => (
                <div key={val} className="flex items-center gap-1.5">
                  <Check className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" />
                  <span className="text-xs font-semibold text-brand-slate-600">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ── 2. Booking experience ── */}
      <div id="booking" className="bg-brand-slate-50/50 border-y border-brand-slate-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left: benefits */}
            <ScrollReveal className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                  Strategy Session
                </span>
                <h3 className="text-2xl font-extrabold text-brand-navy tracking-tight">
                  Book your free 30-minute session.
                </h3>
                <p className="text-sm text-brand-slate-500 leading-relaxed">
                  A focused conversation about your business, your challenges, and the systems that could transform the way you operate.
                </p>
              </div>

              <div className="space-y-2.5">
                {bookingBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-xs text-brand-slate-600 font-medium leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-white border border-brand-blue/15 rounded-2xl shadow-sm space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold">Response Time</p>
                <p className="text-2xl font-black text-brand-navy font-mono">{"< 24hrs"}</p>
                <p className="text-xs text-brand-slate-500">We acknowledge every enquiry the same business day.</p>
              </div>
            </ScrollReveal>

            {/* Right: form */}
            <ScrollReveal className="lg:col-span-8" delay={0.1}>
              <div className="bg-white border border-brand-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <BookingForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ── 3. Other contact options ── */}
      <div className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        <ScrollReveal>
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              Other Ways to Reach Us
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
              Choose how you want to connect.
            </h3>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactOptions.map((option, index) => (
            <ContactCard key={option.id} option={option} index={index} />
          ))}
        </div>
      </div>

      {/* ── 4. What happens next ── */}
      <div className="py-16 sm:py-24 bg-brand-slate-50/50 border-y border-brand-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                What Happens Next
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Exactly what to expect after you reach out.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
                Click any step to see the deliverables, duration, and outcome at each stage.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <NextStepTimeline />
          </ScrollReveal>
        </div>
      </div>

      {/* ── 5. Discovery call agenda ── */}
      <div className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        <ScrollReveal>
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              Discovery Call Agenda
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
              What we cover in 30 minutes.
            </h3>
            <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
              Every strategy session follows a consistent structure so you leave with real clarity — not a vague discussion.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.07}>
          {agendaItems.map((item) => {
            const Icon = agendaIcons[item.id] ?? MessageCircle;
            return (
              <StaggerItem key={item.id}>
                <motion.div
                  className="p-5 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors h-full"
                  whileHover={shouldReduce ? {} : { y: -4 }}
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center mb-3 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h4 className="text-xs font-bold text-brand-navy mb-1.5 group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-brand-slate-500 leading-relaxed">{item.description}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

      {/* ── 6. FAQ ── */}
      <div className="py-16 sm:py-24 bg-brand-slate-50/50 border-y border-brand-slate-100">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 space-y-10">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                FAQ
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Before you reach out.
              </h3>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {contactFaqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <ScrollReveal key={index} delay={index * 0.04}>
                  <div className="bg-white border border-brand-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-brand-navy hover:text-brand-blue transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
                      aria-expanded={isExpanded}
                      aria-controls={`cfaq-${index}`}
                      id={`cfaq-btn-${index}`}
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
                          id={`cfaq-${index}`}
                          role="region"
                          aria-labelledby={`cfaq-btn-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: shouldReduce ? 0.1 : 0.24, ease: "easeInOut" }}
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

      {/* ── 7. Final CTA ── */}
      <div className="py-12 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
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
                Free. No obligation. No pressure.
              </motion.div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white max-w-2xl mx-auto">
                Let's build your competitive advantage.
              </h2>

              <p className="text-sm text-brand-slate-300 leading-relaxed max-w-lg mx-auto">
                Whether you're replacing outdated systems or building something entirely new, we'll help you create software that delivers measurable, lasting business value.
              </p>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <motion.a
                  href="#booking"
                  className="px-6 py-3.5 rounded-full bg-white text-brand-navy text-xs font-bold flex items-center gap-1.5 hover:bg-brand-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                >
                  Book Strategy Session
                  <ArrowRight className="w-4 h-4 text-brand-indigo" aria-hidden="true" />
                </motion.a>
                <motion.button
                  onClick={onOpenChat}
                  className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all focus-visible:outline-2 focus-visible:outline-white"
                  whileHover={shouldReduce ? {} : { y: -2 }}
                  whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  aria-label="See LeadFlow live"
                >
                  See LeadFlow Live
                </motion.button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

    </section>
  );
});

export default ContactSection;
