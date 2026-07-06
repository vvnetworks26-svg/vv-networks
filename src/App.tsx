import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
  Send,
  X,
  Calendar,
  Shield,
  Cpu,
  Code,
  Layers,
  Cloud,
  ArrowUpRight,
  Check,
  Users,
  TrendingUp,
  Clock,
  Workflow,
  Heart,
  ExternalLink,
  ChevronDown,
  Zap,
  Globe,
  Lock,
  BarChart3,
  Star,
  Bot,
  Database,
  GitBranch,
  Monitor,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import InteractiveDashboard from "./components/InteractiveDashboard";
import BookingModal from "./components/BookingModal";
import ScrollReveal from "./components/ScrollReveal";
import StaggerContainer, { StaggerItem } from "./components/StaggerContainer";
import LeadFlowExperience from "./components/leadflow-experience";
import PortfolioSection from "./components/portfolio";
import ServicesSection from "./components/services";
import PricingSection from "./components/pricing";
import AboutSection from "./components/about";
import ContactSection from "./components/contact";
import { LeadFlowProvider, LeadFlowWidget, useLeadFlow } from "./components/leadflow-sdk";
import { api } from "./lib/apiClient";
import type { ChatMessage } from "./lib/apiClient";
import { CaseStudy, ServiceItem, PricingTier } from "./types";

/* ─────────────────────────────────────────────────────────
   Reusable primitive: ripple button
───────────────────────────────────────────────────────── */
interface RippleButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

function RippleButton({ children, variant = "primary", className = "", onClick, ...rest }: RippleButtonProps) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!shouldReduce && ref.current) {
      const btn = ref.current;
      const circle = document.createElement("span");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        border-radius:50%;background:rgba(255,255,255,0.25);
        transform:translate(-50%,-50%) scale(0);
        left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;
        animation:ripple 0.55s linear;pointer-events:none;
      `;
      btn.appendChild(circle);
      circle.addEventListener("animationend", () => circle.remove());
    }
    onClick?.(e);
  };

  const base = "relative overflow-hidden inline-flex items-center gap-1.5 font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue";
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-tr from-brand-blue to-brand-indigo hover:from-brand-indigo hover:to-brand-violet text-white shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/30 hover:-translate-y-0.5",
    secondary: "bg-brand-navy hover:bg-brand-slate-800 text-white shadow-lg shadow-brand-navy/10 hover:-translate-y-0.5",
    ghost: "bg-white hover:bg-brand-slate-50 text-brand-navy border border-brand-slate-200 hover:border-brand-slate-300",
    outline: "bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/40",
  };

  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Floating ambient orb (pure decoration)
───────────────────────────────────────────────────────── */
function FloatingOrb({ color, size, top, left, right, blur, opacity, delay = 0 }: {
  color: string; size: string; top?: string; left?: string; right?: string;
  blur: string; opacity: number; delay?: number;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none -z-10"
      style={{ background: color, width: size, height: size, top, left, right, filter: `blur(${blur})`, opacity }}
      animate={shouldReduce ? {} : { y: [0, -18, 0], x: [0, 10, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   Animated gradient headline word
───────────────────────────────────────────────────────── */
function GradientWord({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-violet">
      {children}
    </span>
  );
}

export default function App() {
  return (
    <LeadFlowProvider config={{ mode: "demo" }}>
      <AppInner />
    </LeadFlowProvider>
  );
}

function AppInner() {
  const shouldReduce = useReducedMotion();
  const { openWidget } = useLeadFlow();

  // Navigation & Interactive States
  const [activeSection, setActiveSection] = useState("home");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  // FAQ Expanded States
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Interactive Flow Selector
  const [activeFlowStep, setActiveFlowStep] = useState(0);

  // Header scroll state
  const [scrolled, setScrolled] = useState(false);

  const triggerDashboardSync = () => setDashboardRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Data definitions ── */
  const flowSteps = [
    { num: "01", icon: Globe, title: "Visitor Arrives", desc: "A prospect lands on your site. Instead of a static form, they're greeted by a responsive, expert-level conversational agent." },
    { num: "02", icon: Bot, title: "AI Converses", desc: "LeadFlow engages in real time — evaluating intent, handling multi-lingual questions, and extracting structured business context." },
    { num: "03", icon: Zap, title: "Instant Qualification", desc: "The agent verifies qualification signals: revenue tier, company size, urgency. High-intent leads are flagged and prioritized immediately." },
    { num: "04", icon: Calendar, title: "Auto Booking", desc: "Qualified prospects are prompted to reserve an open slot directly within the widget — synced live to your team's calendar." },
    { num: "05", icon: BarChart3, title: "Pipeline Sync", desc: "Clean contact data, conversation summaries, and meeting times populate your Business OS dashboard and push to your CRM via webhooks." },
  ];

  const faqs = [
    {
      q: "What makes VV Networks different from a traditional web agency?",
      a: "Traditional agencies hand off static sites built on generic page builders. VV Networks is a premium AI software studio. We treat your web presence as a living, engineered product — combining custom React/TypeScript code with intelligent workflows like LeadFlow to automate qualification and operations from day one.",
    },
    {
      q: "How does LeadFlow capture and qualify leads securely?",
      a: "LeadFlow runs server-side on Google Gemini AI models, using system-level instructions customized for your business. It extracts contact and qualification data organically through natural dialogue, structures it as clean JSON, and pushes it to your CRM over encrypted TLS channels.",
    },
    {
      q: "What does a typical project timeline look like?",
      a: "We move with precision. A custom high-converting website with LeadFlow integrated is typically live in 3–4 weeks. Advanced custom databases, CRM consolidations, or comprehensive workflow automations ship in 6–10 weeks.",
    },
    {
      q: "Do we own the code built for our project?",
      a: "Yes, fully. Upon final milestone completion, all intellectual property and code repositories are transferred directly to your organization's GitHub or preferred cloud environment.",
    },
    {
      q: "Can LeadFlow integrate with our existing CRM or calendar tool?",
      a: "Yes. LeadFlow ships with native connectors for Google Calendar, Outlook, HubSpot, Salesforce, and Zapier. Custom webhook integrations are available for any platform with a REST API.",
    },
    {
      q: "How do we get started?",
      a: "Click 'Book Team Demo' to reserve a 15-minute founding-team screen-share. We'll map your operational bottlenecks, outline a tailored software strategy, and deliver a transparent project scope for your review.",
    },
  ];

  const techStack = [
    { name: "React", icon: Monitor, color: "text-cyan-500", bg: "bg-cyan-50" },
    { name: "TypeScript", icon: Code, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Node.js", icon: Layers, color: "text-green-600", bg: "bg-green-50" },
    { name: "MongoDB", icon: Database, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "OpenAI / Gemini", icon: Bot, color: "text-violet-600", bg: "bg-violet-50" },
    { name: "Docker", icon: Cloud, color: "text-sky-600", bg: "bg-sky-50" },
    { name: "AWS / GCP", icon: Globe, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Vercel", icon: GitBranch, color: "text-brand-navy", bg: "bg-brand-slate-100" },
  ];

  /* ── Animated headline words ── */
  const headlineWords = ["Engineering", "Intelligence", "for Service", "Growth."];

  return (
    <div className="min-h-screen bg-white text-brand-navy selection:bg-brand-indigo/10 flex flex-col font-sans relative overflow-x-hidden">

      {/* ── Ambient floating orbs ── */}
      <FloatingOrb color="#2563EB" size="560px" top="-80px" left="20%" blur="130px" opacity={0.05} delay={0} />
      <FloatingOrb color="#8B5CF6" size="480px" top="30%" right="5%" blur="120px" opacity={0.05} delay={3} />
      <FloatingOrb color="#4F46E5" size="400px" top="60%" left="10%" blur="110px" opacity={0.04} delay={5} />

      {/* ── Global Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-white/85 backdrop-blur-lg border-b border-brand-slate-200/60 py-4 shadow-sm" : "bg-transparent py-6"
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          <button
            className="flex items-center gap-2 cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue rounded"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="VV Networks — scroll to top"
          >
            <motion.div
              className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-black text-lg shadow-md shadow-brand-blue/10"
              whileHover={shouldReduce ? {} : { scale: 1.08, rotate: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              V
            </motion.div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-brand-navy block">VV Networks</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-brand-slate-400 font-bold block -mt-1.5">AI Product Studio</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {[["LeadFlow", "#leadflow"], ["Services", "#services"], ["Case Studies", "#portfolio"], ["Process", "#process"], ["Pricing", "#pricing"]].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-xs font-semibold text-brand-slate-500 hover:text-brand-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue rounded"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { openWidget(); }}
              className="hidden sm:inline-flex px-4 py-2 rounded-full border border-brand-slate-200 text-xs font-bold text-brand-slate-700 hover:bg-brand-slate-50 transition-all gap-1.5 items-center focus-visible:outline-2 focus-visible:outline-brand-blue"
              aria-label="Open LeadFlow widget demo"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-blue" aria-hidden="true" />
              Demo LeadFlow Widget
            </button>
            <RippleButton
              variant="secondary"
              className="px-5 py-2.5 rounded-full text-xs"
              onClick={() => setIsBookingOpen(true)}
              aria-label="Book a team demo"
            >
              Book Team Demo
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </RippleButton>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 sm:pt-32" id="main-content">

        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <section id="hero" className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left: copy */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">

              <motion.div
                initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/5 border border-brand-blue/10 text-[11px] font-bold text-brand-blue tracking-wide uppercase"
              >
                <motion.span animate={shouldReduce ? {} : { rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <Sparkles className="w-3 h-3 text-brand-violet" aria-hidden="true" />
                </motion.span>
                VV Networks · LeadFlow OS 3.0 Live
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-brand-navy leading-[1.05] font-sans">
                {headlineWords.map((word, i) => (
                  <motion.span
                    key={word}
                    className={`block ${i === 1 ? "" : ""}`}
                    initial={{ opacity: 0, y: shouldReduce ? 0 : 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: shouldReduce ? 0 : 0.15 + i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                  >
                    {i === 1 ? <GradientWord>{word}</GradientWord> : word}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: shouldReduce ? 0 : 0.55 }}
              >
                We build AI-powered software, autonomous lead systems, and precision-engineered websites that turn raw traffic into qualified pipeline — and eliminate the manual overhead holding your business back.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3 pt-2"
                initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: shouldReduce ? 0 : 0.65 }}
              >
                <RippleButton
                  variant="primary"
                  className="px-6 py-3.5 rounded-full text-xs"
                  onClick={() => setIsBookingOpen(true)}
                  aria-label="Book a 15-minute demo"
                >
                  Book 15-Min Demo
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </RippleButton>
                <a
                  href="#leadflow"
                  className="px-6 py-3.5 rounded-full border border-brand-slate-200 hover:border-brand-slate-300 bg-white text-xs font-bold text-brand-slate-700 hover:text-brand-navy transition-all flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-brand-blue"
                >
                  Explore LeadFlow
                  <ChevronDown className="w-4 h-4 text-brand-slate-400" aria-hidden="true" />
                </a>
              </motion.div>

              <motion.div
                className="pt-8 sm:pt-12 border-t border-brand-slate-100 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: shouldReduce ? 0 : 0.8 }}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-400">
                  Outcomes comparable to
                </span>
                <div className="flex flex-wrap gap-x-6 gap-y-2 opacity-40">
                  {["Stripe", "Vercel", "Linear", "Framer", "Notion"].map((item, i) => (
                    <motion.span
                      key={item}
                      className="text-xs font-extrabold tracking-tight font-sans text-brand-navy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: shouldReduce ? 0 : 0.85 + i * 0.07 }}
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: dashboard */}
            <motion.div
              className="lg:col-span-7 flex flex-col justify-center relative"
              initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: shouldReduce ? 0 : 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-brand-violet/5 rounded-3xl filter blur-[60px] opacity-40 -z-10" />
              <InteractiveDashboard triggerRefresh={dashboardRefreshTrigger} />

              <motion.div
                className="absolute -bottom-6 right-6 sm:right-12 bg-white px-4 py-3 border border-brand-slate-200 rounded-xl shadow-xl flex items-center gap-3"
                initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.9, y: shouldReduce ? 0 : 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, delay: shouldReduce ? 0 : 0.9 }}
              >
                <div className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-slate-400 block">LeadFlow Engine</span>
                  <span className="text-xs font-bold text-brand-navy block -mt-0.5">Actively qualifying live traffic</span>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ══════════════════════════════════════════
            LEADFLOW CENTERPIECE SECTION
        ══════════════════════════════════════════ */}
        <section id="leadflow" className="py-20 sm:py-32 bg-brand-slate-50/50 border-y border-brand-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">

            <ScrollReveal>
              <div className="max-w-3xl space-y-4">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">Flagship Product</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-navy">
                  Stop asking leads to fill out forms.{" "}
                  <span className="text-brand-slate-400">Start demonstrating instant value.</span>
                </h2>
                <p className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-xl">
                  LeadFlow is a conversational AI agent that lives on your site. It qualifies visitors in real time, answers questions about your offer, and automatically books consultations into your calendar — while you sleep.
                </p>
              </div>
            </ScrollReveal>

            {/* Interactive product experience */}
            <ScrollReveal delay={0.15}>
              <LeadFlowExperience />
            </ScrollReveal>

            {/* Sandbox CTA */}
            <ScrollReveal delay={0.2}>
              <div className="p-8 sm:p-12 bg-white border border-brand-slate-200 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-violet/5 rounded-full filter blur-[60px] pointer-events-none" />
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

                  <div className="md:col-span-5 space-y-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue">
                      <Workflow className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-brand-navy tracking-tight">
                      Experience it live on this site
                    </h3>
                    <p className="text-xs text-brand-slate-500 leading-relaxed">
                      Use the floating LeadFlow widget at the bottom right to ask questions or simulate a consultation booking. Watch as it syncs live to the Business OS dashboard above.
                    </p>
                    <div className="space-y-3.5">
                      {["Increase raw lead conversion by up to 300%", "Fully customized context and tone", "Automated follow-ups and reminders"].map((feat) => (
                        <div key={feat} className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 bg-emerald-50 rounded-full p-0.5 flex-shrink-0" aria-hidden="true" />
                          <span className="text-xs font-medium text-brand-slate-600">{feat}</span>
                        </div>
                      ))}
                    </div>
                    <RippleButton
                      variant="secondary"
                      className="px-5 py-3 rounded-xl text-xs"
                      onClick={() => { openWidget(); }}
                      aria-label="Open LeadFlow sandbox widget"
                    >
                      Initialize Sandbox Widget
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </RippleButton>
                  </div>

                  {/* Live conversion flow visualization */}
                  <div className="md:col-span-7 border border-brand-slate-200 bg-brand-slate-50 rounded-2xl p-6 relative min-h-[260px] flex flex-col justify-center space-y-4">
                    {[
                      { label: "Anonymous Visitor", sub: "IP Ref: 104.28.32.*", badge: "LANDED", badgeClass: "bg-brand-blue/5 text-brand-blue", icon: Globe, iconBg: "bg-brand-blue/10 text-brand-blue" },
                      { label: "AI Conversation Active", sub: "Goal: Extract business size & timeline", badge: "QUALIFYING", badgeClass: "bg-amber-50 text-amber-700", icon: Bot, iconBg: "bg-brand-indigo/10 text-brand-indigo" },
                      { label: "High-Intent Lead Detected", sub: "Consultation slot auto-booked", badge: "CONVERTED", badgeClass: "bg-emerald-50 text-emerald-700", icon: CheckCircle, iconBg: "bg-emerald-50 text-emerald-600" },
                    ].map((row, i) => (
                      <React.Fragment key={row.label}>
                        <motion.div
                          className="bg-white p-4 border border-brand-slate-200 rounded-xl flex items-center justify-between shadow-sm"
                          initial={{ opacity: 0, x: shouldReduce ? 0 : -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + i * 0.15, duration: 0.45 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${row.iconBg}`}>
                              <row.icon className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <div>
                              <span className="text-xs font-bold block text-brand-navy">{row.label}</span>
                              <span className="text-[10px] text-brand-slate-400 font-mono">{row.sub}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${row.badgeClass}`}>{row.badge}</span>
                        </motion.div>
                        {i < 2 && (
                          <div className="flex justify-center">
                            <motion.div
                              animate={shouldReduce ? {} : { y: [0, 4, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                            >
                              <ChevronDown className="w-4 h-4 text-brand-slate-300" aria-hidden="true" />
                            </motion.div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
        {/* ══════════════════════════════════════════
            SERVICES SECTION
        ══════════════════════════════════════════ */}
        <ServicesSection
          onBookDemo={() => setIsBookingOpen(true)}
          onOpenChat={() => { openWidget(); }}
        />

        {/* ══════════════════════════════════════════
            PORTFOLIO / CASE STUDIES
        ══════════════════════════════════════════ */}
        <PortfolioSection onBookDemo={() => setIsBookingOpen(true)} />

        {/* ══════════════════════════════════════════
            TECHNOLOGY SECTION
        ══════════════════════════════════════════ */}
        <section id="technology" className="py-20 sm:py-28 max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <ScrollReveal>
            <div className="max-w-2xl space-y-4 text-center mx-auto">
              <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">Engineering Stack</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy">
                Built on the tools the best teams use.
              </h2>
              <p className="text-sm text-brand-slate-500 leading-relaxed">
                Every technology choice is deliberate — optimized for performance, security, and long-term maintainability.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4" staggerDelay={0.07}>
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <StaggerItem key={tech.name}>
                  <motion.div
                    className="p-5 bg-white border border-brand-slate-200 rounded-2xl flex flex-col items-center gap-3 group cursor-default"
                    whileHover={shouldReduce ? {} : { y: -4, boxShadow: "0 12px 40px -10px rgba(0,0,0,0.08)" }}
                    transition={{ type: "spring", stiffness: 360, damping: 22 }}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tech.bg} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${tech.color}`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold text-brand-navy text-center leading-tight">{tech.name}</span>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* ══════════════════════════════════════════
            DEVELOPMENT PROCESS
        ══════════════════════════════════════════ */}
        <section id="process" className="py-20 sm:py-32 bg-brand-slate-50/50 border-t border-brand-slate-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            <ScrollReveal>
              <div className="max-w-3xl space-y-4 text-center mx-auto">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">Rigorous Standards</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-navy">
                  How we go from idea to production.
                </h2>
                <p className="text-sm sm:text-base text-brand-slate-500 leading-relaxed max-w-xl mx-auto">
                  A disciplined five-phase process that eliminates scope drift and delivers measurable results on schedule.
                </p>
              </div>
            </ScrollReveal>

            <div className="relative">
              {/* Animated connector line */}
              <div className="hidden md:block absolute top-9 left-[calc(10%+24px)] right-[calc(10%+24px)] h-0.5 bg-brand-slate-200 -z-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-violet origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
              </div>

              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 relative" staggerDelay={0.12}>
                {[
                  { step: "01", title: "Discovery", desc: "We audit your customer flows, technology stack, and manual workflows to define a precise functional specification." },
                  { step: "02", title: "Design", desc: "High-fidelity prototypes and system schemas reviewed with your team before a single line of production code is written." },
                  { step: "03", title: "Development", desc: "Senior engineers build your React/TypeScript repository with clean API layers and full test coverage." },
                  { step: "04", title: "Deployment", desc: "Staged rollout with automated CI/CD pipelines. Zero-downtime launches with instant rollback capability." },
                  { step: "05", title: "Optimization", desc: "Post-launch, we tune LLM parameters, monitor conversion analytics, and ship iterative improvements continuously." },
                ].map((pStep, i) => (
                  <StaggerItem key={pStep.step}>
                    <div className="flex flex-col items-center text-center group">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-white border-2 border-brand-slate-200 flex items-center justify-center text-sm font-black font-mono text-brand-slate-400 group-hover:border-brand-blue group-hover:text-brand-blue transition-colors mb-5 relative z-10 shadow-sm"
                        whileHover={shouldReduce ? {} : { scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {pStep.step}
                      </motion.div>
                      <h4 className="font-bold text-sm text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">{pStep.title}</h4>
                      <p className="text-xs text-brand-slate-500 leading-relaxed">{pStep.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
        {/* ══════════════════════════════════════════
            PRICING PLANS
        ══════════════════════════════════════════ */}
        <PricingSection
          onBookDemo={() => setIsBookingOpen(true)}
          onOpenChat={() => { openWidget(); }}
        />

        {/* ══════════════════════════════════════════
        {/* ══════════════════════════════════════════
            ABOUT / COMPANY
        ══════════════════════════════════════════ */}
        <AboutSection
          onBookDemo={() => setIsBookingOpen(true)}
          onOpenChat={() => { openWidget(); }}
        />

        {/* ══════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════ */}
        <section id="faq" className="py-20 sm:py-32">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-12">
            <ScrollReveal>
              <div className="text-center space-y-3">
                <span className="text-[11px] font-bold text-brand-blue font-mono uppercase tracking-wider block">Clear Explanations</span>
                <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy">Frequently Asked Questions</h2>
                <p className="text-sm text-brand-slate-500 max-w-lg mx-auto leading-relaxed">
                  Straight answers about LeadFlow, our software process, and how we work.
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="space-y-3" staggerDelay={0.07}>
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <StaggerItem key={index}>
                    <div className="bg-white border border-brand-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : index)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-brand-navy hover:text-brand-blue transition-colors focus-visible:outline-2 focus-visible:outline-brand-blue focus-visible:outline-offset-2"
                        aria-expanded={isExpanded}
                        aria-controls={`faq-answer-${index}`}
                        id={`faq-question-${index}`}
                      >
                        <span>{faq.q}</span>
                        <motion.div
                          animate={shouldReduce ? {} : { rotate: isExpanded ? 45 : 0 }}
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
                            id={`faq-answer-${index}`}
                            role="region"
                            aria-labelledby={`faq-question-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: shouldReduce ? 0.1 : 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-6 pb-5 text-xs text-brand-slate-500 leading-relaxed border-t border-brand-slate-100/80 pt-4">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CONTACT / CONVERSION
        ══════════════════════════════════════════ */}
        <ContactSection
          onOpenChat={() => { openWidget(); }}
        />

      </main>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-brand-slate-50 border-t border-brand-slate-200/60 py-12 sm:py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-brand-blue flex items-center justify-center text-white font-black text-sm" aria-hidden="true">V</div>
                <span className="font-extrabold text-base tracking-tight text-brand-navy">VV Networks</span>
              </div>
              <p className="text-xs text-brand-slate-500 leading-relaxed max-w-xs">
                A premium AI software studio engineering custom databases, intelligent automations, and high-converting web experiences.
              </p>
              <span className="text-[10px] text-brand-slate-400 font-mono block">
                © {new Date().getFullYear()} VV Networks. All rights reserved.
              </span>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                {
                  heading: "Product",
                  links: [["LeadFlow Widget", "#leadflow"], ["Pricing", "#pricing"], ["Interactive Sandbox", "#hero"]],
                  isButton: false,
                },
                {
                  heading: "Capabilities",
                  links: [["AI Automation", "#services"], ["Custom Software", "#services"], ["Web Development", "#services"], ["Enterprise Cloud", "#services"]],
                  isButton: false,
                },
                {
                  heading: "Company",
                  links: [["Philosophy", "#about"], ["Case Studies", "#portfolio"], ["Process", "#process"], ["FAQs", "#faq"]],
                  isButton: false,
                },
              ].map((col) => (
                <div key={col.heading} className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-400">{col.heading}</span>
                  <ul className="space-y-2">
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        <a href={href} className="text-xs text-brand-slate-600 hover:text-brand-navy transition-colors focus-visible:outline-1 focus-visible:outline-brand-blue rounded">
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-slate-400">Support</span>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => setIsBookingOpen(true)} className="text-xs text-brand-slate-600 hover:text-brand-navy transition-colors text-left focus-visible:outline-1 focus-visible:outline-brand-blue rounded">
                      Book Demo
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { openWidget(); }} className="text-xs text-brand-slate-600 hover:text-brand-navy transition-colors text-left focus-visible:outline-1 focus-visible:outline-brand-blue rounded">
                      Chat with LeadFlow
                    </button>
                  </li>
                  <li>
                    <a href="mailto:vvnetworks26@gmail.com" className="text-xs text-brand-slate-600 hover:text-brand-navy transition-colors focus-visible:outline-1 focus-visible:outline-brand-blue rounded">
                      vvnetworks26@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-brand-slate-200 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] text-brand-slate-400 font-mono">
            <div className="flex flex-wrap gap-4">
              <span>GDPR Compliant</span>
              <span>SOC2 Infrastructure</span>
              <span>Gemini Model Proxy Secured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" aria-hidden="true" />
              <span>for world-class partners</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          LEADFLOW SDK WIDGET
      ══════════════════════════════════════════ */}
      <LeadFlowWidget onBookDemo={() => setIsBookingOpen(true)} />

      {/* ══════════════════════════════════════════
          BOOKING MODAL
      ══════════════════════════════════════════ */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={triggerDashboardSync}
      />

    </div>
  );
}
