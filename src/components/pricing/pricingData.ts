export interface EngagementModel {
  id: string;
  name: string;
  tagline: string;
  idealFor: string;
  deliveryTime: string;
  support: string;
  highlight: boolean;
  gradient: string;
  accentClass: string;
  deliverables: string[];
  outcomes: string[];
  cta: string;
  ctaSecondary?: string;
}

export interface MatrixRow {
  label: string;
  category: string;
  leadflow: boolean | "partial";
  growthWeb: boolean | "partial";
  customSoft: boolean | "partial";
  techPartner: boolean | "partial";
}

export interface IncludedItem {
  icon: string;
  title: string;
  description: string;
}

export interface JourneyStep {
  step: string;
  title: string;
  duration: string;
  deliverables: string[];
  outcome: string;
  color: string;
}

export interface PricingFAQItem {
  q: string;
  a: string;
}

export const engagementModels: EngagementModel[] = [
  {
    id: "leadflow",
    name: "LeadFlow",
    tagline: "AI receptionist that qualifies leads and books appointments around the clock.",
    idealFor: "Service businesses receiving consistent inbound inquiries who want automated lead capture without committing to a full software build.",
    deliveryTime: "2–3 weeks",
    support: "Email & chat support",
    highlight: false,
    gradient: "from-brand-blue/8 via-brand-indigo/5 to-transparent",
    accentClass: "text-brand-blue",
    deliverables: [
      "AI chat widget (custom-trained)",
      "Lead qualification logic",
      "Appointment booking integration",
      "Business OS dashboard",
      "Monthly performance report",
    ],
    outcomes: [
      "24/7 lead qualification",
      "Automatic calendar booking",
      "Structured pipeline data",
    ],
    cta: "Book LeadFlow Demo",
  },
  {
    id: "growth-web",
    name: "Growth Website",
    tagline: "Precision-engineered website built to convert visitors into booked consultations.",
    idealFor: "Businesses whose current site doesn't reflect their quality, fails to generate leads, or is costing them credibility.",
    deliveryTime: "3–4 weeks",
    support: "30-day post-launch support",
    highlight: false,
    gradient: "from-emerald-50/80 via-teal-50/40 to-transparent",
    accentClass: "text-emerald-700",
    deliverables: [
      "Discovery & UX strategy",
      "Custom React + TypeScript build",
      "LeadFlow widget pre-integrated",
      "SEO foundation & analytics",
      "Performance optimisation",
    ],
    outcomes: [
      "4× higher conversion vs templates",
      "Sub-second page load",
      "Immediate lead capture on launch",
    ],
    cta: "Start Website Project",
  },
  {
    id: "custom-soft",
    name: "Custom Software",
    tagline: "Purpose-built systems that automate your workflow end-to-end.",
    idealFor: "Growing businesses running on spreadsheets, legacy tools, or disconnected manual processes that prevent scaling.",
    deliveryTime: "6–10 weeks",
    support: "90-day post-launch SLA",
    highlight: true,
    gradient: "from-brand-indigo/8 via-brand-violet/5 to-transparent",
    accentClass: "text-brand-indigo",
    deliverables: [
      "Architecture & system design",
      "Custom dashboard & admin portal",
      "Workflow automation",
      "Third-party integrations",
      "Testing, deployment & documentation",
    ],
    outcomes: [
      "All operations in one system",
      "80% reduction in manual admin",
      "Scales without adding headcount",
    ],
    cta: "Discuss Your Project",
  },
  {
    id: "tech-partner",
    name: "Technology Partner",
    tagline: "Your long-term engineering team — strategy, build, and continuous optimisation.",
    idealFor: "Businesses with ongoing development needs, multiple products in motion, or complex AI integration requirements.",
    deliveryTime: "Ongoing",
    support: "Priority — dedicated Slack channel",
    highlight: false,
    gradient: "from-brand-navy/5 via-brand-slate-100/60 to-transparent",
    accentClass: "text-brand-navy",
    deliverables: [
      "Roadmap planning",
      "Priority development capacity",
      "Unlimited strategy sessions",
      "Continuous improvement cycles",
      "Monthly architecture reviews",
    ],
    outcomes: [
      "Technology aligned to business growth",
      "Continuous iteration",
      "Senior engineering team on demand",
    ],
    cta: "Become a Partner",
  },
];

export const matrixRows: MatrixRow[] = [
  // Process
  { label: "Discovery & Audit",       category: "Process",     leadflow: "partial", growthWeb: true,      customSoft: true,      techPartner: true      },
  { label: "Research & Strategy",     category: "Process",     leadflow: false,     growthWeb: true,      customSoft: true,      techPartner: true      },
  { label: "UI/UX Design",            category: "Process",     leadflow: false,     growthWeb: true,      customSoft: true,      techPartner: true      },
  { label: "Custom Development",      category: "Process",     leadflow: true,      growthWeb: true,      customSoft: true,      techPartner: true      },
  { label: "Testing & QA",            category: "Process",     leadflow: "partial", growthWeb: "partial", customSoft: true,      techPartner: true      },
  { label: "Deployment & Launch",     category: "Process",     leadflow: true,      growthWeb: true,      customSoft: true,      techPartner: true      },
  { label: "Documentation",           category: "Process",     leadflow: false,     growthWeb: "partial", customSoft: true,      techPartner: true      },
  { label: "Team Training",           category: "Process",     leadflow: false,     growthWeb: false,     customSoft: true,      techPartner: true      },
  // Support
  { label: "Ongoing Support",         category: "Support",     leadflow: "partial", growthWeb: "partial", customSoft: "partial", techPartner: true      },
  { label: "Continuous Optimisation", category: "Support",     leadflow: false,     growthWeb: false,     customSoft: false,     techPartner: true      },
  { label: "Monthly Reviews",         category: "Support",     leadflow: false,     growthWeb: false,     customSoft: false,     techPartner: true      },
  { label: "Security Maintenance",    category: "Support",     leadflow: "partial", growthWeb: "partial", customSoft: "partial", techPartner: true      },
  // Capabilities
  { label: "AI Integration",          category: "Capabilities", leadflow: true,     growthWeb: true,      customSoft: "partial", techPartner: true      },
  { label: "Workflow Automation",     category: "Capabilities", leadflow: "partial", growthWeb: false,    customSoft: true,      techPartner: true      },
  { label: "Analytics Dashboard",     category: "Capabilities", leadflow: true,     growthWeb: "partial", customSoft: true,      techPartner: true      },
];

export const includedItems: IncludedItem[] = [
  { icon: "UserCheck",     title: "Dedicated Project Manager",  description: "A single point of contact owns your project from kickoff to delivery." },
  { icon: "MessageCircle", title: "Weekly Progress Updates",    description: "Transparent weekly check-ins — you always know exactly where things stand." },
  { icon: "FileText",      title: "Full Documentation",         description: "Clean technical documentation and handover materials delivered with every project." },
  { icon: "Shield",        title: "Quality Assurance",          description: "Automated and manual testing before anything ships to production." },
  { icon: "Rocket",        title: "Managed Launch",             description: "Staged rollout with monitoring and instant rollback capability on go-live." },
  { icon: "Headphones",    title: "Launch Support",             description: "Active support window immediately after launch — we're available when it matters most." },
  { icon: "Clock",         title: "30-Day Hypercare",           description: "A structured post-launch window for tuning, issue resolution, and user feedback." },
  { icon: "HeartHandshake", title: "Long-Term Relationship",    description: "We're available for future iterations. Clients return because the relationship continues past delivery." },
];

export const journeySteps: JourneyStep[] = [
  {
    step: "01",
    title: "Discovery",
    duration: "3–5 days",
    deliverables: ["Current workflow audit", "Bottleneck mapping", "Technical environment review", "Stakeholder alignment session"],
    outcome: "A clear shared understanding of the problem we're solving and the success criteria.",
    color: "bg-brand-blue",
  },
  {
    step: "02",
    title: "Strategy",
    duration: "3–5 days",
    deliverables: ["Technical architecture design", "Data flow diagrams", "API specifications", "Milestone delivery plan"],
    outcome: "A documented strategy and scoped project plan with transparent timelines.",
    color: "bg-brand-indigo",
  },
  {
    step: "03",
    title: "Proposal",
    duration: "1–2 days",
    deliverables: ["Detailed scope of work", "Milestone-based pricing", "Project timeline", "Risk register"],
    outcome: "A transparent proposal you can review, revise, and approve — no pressure.",
    color: "bg-brand-violet",
  },
  {
    step: "04",
    title: "Development",
    duration: "4–8 weeks",
    deliverables: ["Sprint-based builds", "Weekly demos", "Version-controlled codebase", "Continuous integration pipeline"],
    outcome: "Working software at every sprint. No black-box development — you see progress continuously.",
    color: "bg-violet-500",
  },
  {
    step: "05",
    title: "Testing",
    duration: "1 week",
    deliverables: ["Automated test coverage", "Load & performance testing", "Security review", "User acceptance testing"],
    outcome: "A production-ready system that's been validated by real usage scenarios.",
    color: "bg-amber-500",
  },
  {
    step: "06",
    title: "Launch",
    duration: "2–3 days",
    deliverables: ["Staged production rollout", "Monitoring & alerting setup", "Go-live checklist", "Rollback plan"],
    outcome: "Zero-downtime launch with a safety net. You go live with confidence.",
    color: "bg-emerald-500",
  },
  {
    step: "07",
    title: "Growth",
    duration: "Ongoing",
    deliverables: ["Performance analytics review", "Conversion optimisation", "Feature iterations", "Quarterly planning"],
    outcome: "The system improves continuously. Your competitive advantage compounds.",
    color: "bg-teal-500",
  },
];

export const pricingFaqs: PricingFAQItem[] = [
  {
    q: "How much does a project usually cost?",
    a: "We don't publish fixed prices because every business has different requirements. What we can say: LeadFlow starts at $299/month. A Growth Website typically falls between $4,000–$6,000 depending on scope. Custom software is milestone-priced — you only pay for what gets built, in phases. The best way to get a precise figure is a 15-minute discovery call.",
  },
  {
    q: "How long does implementation take?",
    a: "LeadFlow deploys in 2–3 weeks. Growth Websites take 3–4 weeks. Custom software projects range from 6–10 weeks. Technology Partner engagements operate on continuous monthly cycles. Every project starts with a scoping session that sets a realistic, committed timeline.",
  },
  {
    q: "Can we start with LeadFlow and expand later?",
    a: "Yes — and many clients do exactly this. LeadFlow generates immediate ROI from day one. Once you've seen results, expanding into a custom website or business software system becomes a low-risk, data-backed decision. Each engagement is independent with no lock-in.",
  },
  {
    q: "Can you integrate with our existing software?",
    a: "In almost every case, yes. We integrate with HubSpot, Salesforce, Zapier, Google Workspace, Outlook, Stripe, Twilio, and most platforms with a REST API. For legacy systems, we build custom bridge connectors as part of the project scope.",
  },
  {
    q: "Do you provide ongoing support after launch?",
    a: "Every engagement includes a support window after launch — 30 days for websites, 90 days for custom software. Technology Partner clients have continuous priority support. For other engagements, we offer structured support retainers at competitive rates.",
  },
  {
    q: "What happens after the project is delivered?",
    a: "You receive full IP ownership — all source code, repositories, and documentation transfer to your organisation. We remain available for iterations, and most clients continue with us on a retainer or Technology Partner engagement to keep the system evolving.",
  },
];
