import React, { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight, Sparkles, X, Check,
  MessageCircle, Eye, Calendar, ShieldCheck,
  TrendingUp, HeartHandshake,
} from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import StaggerContainer, { StaggerItem } from "../StaggerContainer";
import PrincipleCard from "./PrincipleCard";
import ThinkingTimeline from "./ThinkingTimeline";
import EngineeringCard from "./EngineeringCard";
import MetricsSection from "./MetricsSection";
import {
  principles,
  engineeringStandards,
  retentionReasons,
} from "./companyData";

const retentionIcons: Record<string, React.ElementType> = {
  communication: MessageCircle,
  transparent: Eye,
  "weekly-updates": Calendar,
  "no-surprises": ShieldCheck,
  optimisation: TrendingUp,
  partnership: HeartHandshake,
};

interface AboutSectionProps {
  onBookDemo: () => void;
  onOpenChat: () => void;
}

const AboutSection = memo(function AboutSection({ onBookDemo, onOpenChat }: AboutSectionProps) {
  const shouldReduce = useReducedMotion();

  return (
    <section id="about" aria-label="About VV Networks">

      {/* ── 1. Company Introduction ── */}
      <div className="py-20 sm:py-32 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <ScrollReveal className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              About VV Networks
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-navy leading-tight">
              Software built with business outcomes in mind.
            </h2>
            <p className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-xl">
              VV Networks builds AI software, websites, and digital systems that help businesses grow faster, operate smarter, and serve customers better. We don't build for the sake of building — we build because the problem is worth solving.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <motion.button
                onClick={onBookDemo}
                className="px-6 py-3 rounded-full bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
                whileHover={shouldReduce ? {} : { y: -2 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                aria-label="Book a strategy session"
              >
                Book a Strategy Session
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </motion.button>
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-5" delay={0.15}>
            <div className="bg-brand-slate-50/60 border border-brand-slate-200 rounded-3xl p-7 space-y-5">
              <h4 className="text-sm font-bold text-brand-navy">A studio, not an agency</h4>
              <p className="text-xs text-brand-slate-500 leading-relaxed">
                Most agencies build websites. We build software systems that create lasting business value — and we stay to make sure they keep working.
              </p>
              <div className="space-y-3.5 pt-2">
                {[
                  { title: "Products we're proud of", desc: "LeadFlow, custom CRMs, booking platforms — software we'd use ourselves." },
                  { title: "First-principles engineering", desc: "No templates, no shortcuts. Every codebase built from scratch for performance." },
                  { title: "Direct senior access", desc: "You work with the engineers building your product. No account managers in the middle." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex-shrink-0 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-brand-navy">{item.title}</h5>
                      <p className="text-xs text-brand-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── 2. Why VV Networks Exists ── */}
      <div className="py-16 sm:py-24 bg-brand-slate-50/50 border-y border-brand-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Why We Exist
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                The industry has a delivery problem.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed max-w-xl mx-auto">
                We started VV Networks because we kept seeing the same pattern: businesses paying for software that didn't solve their actual problem.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <ScrollReveal delay={0.05}>
              <div className="p-6 bg-white border border-brand-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                    <X className="w-4 h-4 text-rose-500" aria-hidden="true" />
                  </div>
                  <h4 className="text-sm font-bold text-brand-slate-600">The typical agency</h4>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Builds a website. Delivers the files. Disappears.",
                    "Recommends the tool that earns them commission.",
                    "Uses generic templates and calls them custom.",
                    "Measures success by delivery date, not business outcomes.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <X className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-brand-slate-500">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="p-6 bg-white border border-brand-blue/20 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-blue/8 flex items-center justify-center">
                    <Check className="w-4 h-4 text-brand-blue" aria-hidden="true" />
                  </div>
                  <h4 className="text-sm font-bold text-brand-navy">VV Networks</h4>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Solves a specific business problem. Measures the result.",
                    "Recommends what creates the most value for you.",
                    "Builds every system from first principles.",
                    "Measures success by business outcomes, not shipping dates.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-brand-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-brand-slate-600 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ── 3. Mission ── */}
      <div className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              className="p-10 sm:p-14 bg-gradient-to-br from-brand-blue/5 via-brand-indigo/5 to-brand-violet/5 border border-brand-blue/10 rounded-3xl space-y-5 relative overflow-hidden"
              whileHover={shouldReduce ? {} : { boxShadow: "0 20px 60px -15px rgba(37,99,235,0.1)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute -top-16 -right-16 w-48 h-48 bg-brand-violet/10 rounded-full pointer-events-none"
                style={{ filter: "blur(50px)" }}
                animate={shouldReduce ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block relative z-10">
                Our Mission
              </span>
              <blockquote className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight leading-snug relative z-10">
                "We believe every growing business deserves software that works as hard as they do."
              </blockquote>
              <p className="text-sm text-brand-slate-500 leading-relaxed relative z-10 max-w-xl mx-auto">
                We build AI systems, automation tools, and precision-engineered software to give businesses the operational leverage that was previously only available to enterprises with large engineering teams.
              </p>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>

      {/* ── 4. Core Principles ── */}
      <div className="py-16 sm:py-24 bg-brand-slate-50/50 border-y border-brand-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Core Principles
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                The standards we hold ourselves to.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
                These aren't values written on a wall. They're the criteria we use to make every technical and strategic decision.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {principles.map((principle, index) => (
              <PrincipleCard key={principle.id} principle={principle} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. How We Think ── */}
      <div className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        <ScrollReveal>
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              How We Think
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
              The loop that drives every engagement.
            </h3>
            <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
              Click any step to understand what happens, why it matters, and what you get from it.
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <ThinkingTimeline />
        </ScrollReveal>
      </div>

      {/* ── 6. Engineering Standards ── */}
      <div className="py-16 sm:py-24 bg-brand-slate-50/50 border-y border-brand-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Engineering Standards
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                What every system we build must meet.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
                These aren't aspirational targets. They are minimum standards applied to every project, every time.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {engineeringStandards.map((standard, index) => (
              <EngineeringCard key={standard.id} standard={standard} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. Why Clients Stay ── */}
      <div className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
        <ScrollReveal>
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
              Why Clients Stay
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
              The reasons clients work with us again.
            </h3>
            <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
              The first project builds trust. The working relationship is what keeps it.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.08}>
          {retentionReasons.map((reason) => {
            const Icon = retentionIcons[reason.id] ?? Check;
            return (
              <StaggerItem key={reason.id}>
                <motion.div
                  className="p-6 bg-white border border-brand-slate-200 rounded-2xl group hover:border-brand-blue/20 transition-colors h-full"
                  whileHover={shouldReduce ? {} : { y: -4 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/5 text-brand-blue flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h4 className="text-sm font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                    {reason.title}
                  </h4>
                  <p className="text-xs text-brand-slate-500 leading-relaxed">{reason.description}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

      {/* ── 8. Numbers That Matter ── */}
      <div className="py-16 sm:py-24 bg-brand-slate-50/50 border-y border-brand-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          <ScrollReveal>
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">
                Numbers That Matter
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
                Commitments, not statistics.
              </h3>
              <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
                Every number below is a real commitment we hold ourselves to — not a marketing metric.
              </p>
            </div>
          </ScrollReveal>
          <MetricsSection />
        </div>
      </div>

      {/* ── 9. Vision ── */}
      <div className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal>
          <div className="relative bg-brand-navy rounded-3xl p-8 sm:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" aria-hidden="true" />
            <motion.div
              className="absolute -top-32 -left-32 w-80 h-80 bg-brand-blue/25 rounded-full pointer-events-none"
              style={{ filter: "blur(90px)" }}
              animate={shouldReduce ? {} : { scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
            <motion.div
              className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-violet/20 rounded-full pointer-events-none"
              style={{ filter: "blur(90px)" }}
              animate={shouldReduce ? {} : { scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-5">
                <motion.div
                  className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1 rounded-full"
                  animate={shouldReduce ? {} : { opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80">
                    Vision
                  </span>
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Building software companies rely on.
                </h3>
                <p className="text-sm text-brand-slate-300 leading-relaxed">
                  LeadFlow is the first product in a suite of AI tools we're building for service businesses. We're working toward a future where any growing business — regardless of budget or technical team size — can operate with the software infrastructure of a company ten times their size.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "LeadFlow Platform", desc: "Expanding LeadFlow from a widget into a full AI business operating system — qualification, booking, follow-up, and CRM in one." },
                  { title: "Industry-Specific AI", desc: "Vertical AI products built for HVAC, legal, real estate, and hospitality — trained on domain knowledge, not generic prompts." },
                  { title: "SaaS Products", desc: "Turning our most successful custom builds into scalable products that any business in the vertical can deploy." },
                  { title: "International Reach", desc: "English-first, but designed for multilingual deployment from the start. LeadFlow already supports any language Gemini supports." },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    className="p-5 bg-white/8 border border-white/10 rounded-xl"
                    initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: shouldReduce ? 0.1 : 0.35, delay: shouldReduce ? 0 : 0.1 + idx * 0.07 }}
                    whileHover={shouldReduce ? {} : { backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    <h5 className="text-xs font-bold text-white mb-1.5">{item.title}</h5>
                    <p className="text-xs text-brand-slate-300 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ── 10. CTA ── */}
      <div className="py-12 pb-24 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal>
          <div className="bg-white border border-brand-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Let's build something exceptional.
            </h3>
            <p className="text-sm text-brand-slate-500 leading-relaxed max-w-lg mx-auto">
              Whether you need AI automation, custom software, or a growth-focused website — we'd love to learn about your business and find out how we can help.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <motion.button
                onClick={onBookDemo}
                className="px-6 py-3.5 rounded-full bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue"
                whileHover={shouldReduce ? {} : { y: -2 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                aria-label="Book a strategy session"
              >
                Book Strategy Session
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </motion.button>
              <motion.button
                onClick={onOpenChat}
                className="px-6 py-3.5 rounded-full border border-brand-slate-200 hover:border-brand-blue/30 text-brand-slate-700 hover:text-brand-navy text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-brand-blue"
                whileHover={shouldReduce ? {} : { y: -2 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                aria-label="See LeadFlow live"
              >
                See LeadFlow Live
              </motion.button>
            </div>
          </div>
        </ScrollReveal>
      </div>

    </section>
  );
});

export default AboutSection;
