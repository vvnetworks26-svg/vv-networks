export type ProjectStatus = "live" | "in-development" | "coming-soon" | "placeholder";

export interface ProjectFeature {
  label: string;
}

export interface CaseStudyDetail {
  overview: string;
  challenge: string;
  approach: string;
  businessValue: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  gradient: string;
  accentColor: string;
  features: ProjectFeature[];
  technology: string[];
  challenge: string;
  solution: string;
  metric?: string;
  metricLabel?: string;
  caseStudy: CaseStudyDetail;
}

export const projects: Project[] = [
  {
    id: "leadflow",
    name: "LeadFlow",
    tagline: "AI receptionist that qualifies leads and books appointments 24/7.",
    category: "AI Receptionist Platform",
    status: "in-development",
    featured: true,
    gradient: "from-brand-blue/10 via-brand-indigo/5 to-brand-violet/10",
    accentColor: "brand-blue",
    features: [
      { label: "Conversational AI Qualification" },
      { label: "Live Appointment Booking" },
      { label: "Business OS Dashboard" },
      { label: "CRM Webhook Integration" },
      { label: "Embeddable Website Widget" },
    ],
    technology: ["React", "TypeScript", "Node.js", "Gemini AI", "Google Calendar", "Vercel"],
    challenge:
      "Service businesses lose 30–40% of inbound leads to slow follow-up, generic web forms, and after-hours gaps. Every missed conversation is a missed revenue opportunity.",
    solution:
      "LeadFlow deploys as an intelligent conversational widget that qualifies visitors in real time, extracts structured lead data through natural dialogue, and auto-books qualified appointments directly into the owner's calendar.",
    metric: "4.2×",
    metricLabel: "Lead-to-Demo Conversion",
    caseStudy: {
      overview:
        "LeadFlow is VV Networks' flagship AI product — a conversational qualification engine built to replace static contact forms with intelligent, outcome-driven conversations.",
      challenge:
        "Service business owners are losing qualified prospects every single day to slow responses and friction-heavy contact experiences. The typical lead form converts at under 3%. Staff can't respond in real time. After-hours inquiries go unanswered. High-intent prospects leave and find a competitor.",
      approach:
        "We engineered a widget that lives on any website and engages visitors within seconds. Powered by Google Gemini, it extracts qualification signals through natural conversation — property type, urgency, budget, location — then books the appointment slot directly. All structured data syncs to the business dashboard and pushes to the owner's CRM.",
      businessValue:
        "Clients deploying LeadFlow see an average 4× increase in lead-to-demo conversion. One client captured $124,000 in additional pipeline in the first 30 days. The system runs continuously — qualifying and booking while the owner is asleep, in a meeting, or on-site.",
    },
  },
  {
    id: "restaurant-suite",
    name: "Restaurant Management Suite",
    tagline: "Full-stack operations platform for modern restaurant groups.",
    category: "Hospitality Technology",
    status: "coming-soon",
    featured: false,
    gradient: "from-amber-50 via-orange-50 to-amber-100",
    accentColor: "amber-600",
    features: [
      { label: "Reservation Management" },
      { label: "Table Map & Floor Control" },
      { label: "Staff Scheduling Dashboard" },
      { label: "Menu & Inventory Sync" },
      { label: "Analytics & Revenue Reporting" },
    ],
    technology: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Redis", "Docker"],
    challenge:
      "Mid-sized restaurant groups manage reservations, staff, inventory, and floor plans across disconnected tools — creating operational blindspots and revenue loss during peak service windows.",
    solution:
      "A unified operations platform built on a real-time reactive architecture. Hosts manage floor maps interactively, managers track covers and revenue live, and staff schedules sync automatically with service demand forecasts.",
    caseStudy: {
      overview:
        "A full-stack hospitality management suite designed to replace fragmented SaaS stacks with a single, purpose-built operations platform for restaurant groups.",
      challenge:
        "Restaurant operators juggle separate tools for reservations, scheduling, inventory, and reporting. Context-switching during peak service creates costly errors. Staff spend time on administrative coordination instead of guest experience.",
      approach:
        "We're engineering a React front-end with an interactive SVG floor plan editor, a FastAPI backend with real-time WebSocket updates, and a PostgreSQL schema optimized for high-volume transactional writes. Redis handles session state for instant floor-level updates.",
      businessValue:
        "Projected to reduce per-shift administrative overhead by 60%, decrease no-show rates through automated confirmation sequences, and surface real-time revenue variance to managers before service ends.",
    },
  },
  {
    id: "real-estate-platform",
    name: "Real Estate Platform",
    tagline: "Property listings, lead capture, and client pipeline in one system.",
    category: "PropTech",
    status: "coming-soon",
    featured: false,
    gradient: "from-emerald-50 via-teal-50 to-emerald-100",
    accentColor: "emerald-600",
    features: [
      { label: "Dynamic Property Listings" },
      { label: "AI-Powered Lead Capture" },
      { label: "Client Pipeline CRM" },
      { label: "Document Automation" },
      { label: "Market Analytics Dashboard" },
    ],
    technology: ["React", "TypeScript", "Node.js", "MongoDB", "AWS S3", "OpenAI"],
    challenge:
      "Independent real estate agencies and teams manage listings, client communications, and document workflows across fragmented tools — creating follow-up delays that cost deals.",
    solution:
      "A purpose-built platform with a property listing engine, AI-powered lead nurturing sequences, and a client pipeline that surfaces the right follow-up at the right time.",
    caseStudy: {
      overview:
        "A modern PropTech platform built for independent agents and boutique agencies that want the operational capability of enterprise tools without the enterprise overhead.",
      challenge:
        "Real estate professionals manually manage follow-ups, listing updates, and document generation across email, spreadsheets, and generic CRMs. Response time directly correlates to deal close rate — and most agents aren't fast enough.",
      approach:
        "We're building a clean property CMS with automated listing syndication, an AI lead nurturing layer that scores and sequences follow-ups based on engagement signals, and a document automation engine that drafts offer letters and NDAs from structured inputs.",
      businessValue:
        "Estimated to reduce time-to-follow-up from 4 hours to under 5 minutes, increase listing inquiry conversion by 40%, and eliminate manual document drafting entirely for standard transaction types.",
    },
  },
  {
    id: "custom-placeholder",
    name: "Your Project",
    tagline: "Engineered from first principles to solve your specific business problem.",
    category: "Custom Software",
    status: "placeholder",
    featured: false,
    gradient: "from-brand-slate-50 via-brand-slate-100 to-brand-slate-50",
    accentColor: "brand-slate-400",
    features: [
      { label: "Custom Architecture" },
      { label: "Built for Your Workflow" },
      { label: "Full IP Ownership" },
      { label: "Ongoing Support SLA" },
      { label: "Scalable from Day One" },
    ],
    technology: ["React", "TypeScript", "Node.js", "Your Stack"],
    challenge: "Every exceptional business has an operational problem that off-the-shelf software can't fully solve.",
    solution:
      "We scope, design, and engineer software systems built specifically around your workflow — not retrofitted from a generic template.",
    caseStudy: {
      overview: "Your project could live here.",
      challenge: "What operational bottleneck is costing your business time or revenue right now?",
      approach:
        "We start with a 15-minute discovery call to understand your exact workflow, constraints, and growth targets. Then we scope a technical solution with a clear milestone plan and transparent pricing.",
      businessValue:
        "Clients who invest in purpose-built software consistently outperform competitors using generic tools — in speed, reliability, and conversion.",
    },
  },
];
