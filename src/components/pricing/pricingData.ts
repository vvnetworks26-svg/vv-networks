export interface EngagementModel {
  id: string;
  name: string;
  tagline: string;
  idealFor: string;
  price: string;
  priceNote: string;
  deliveryTime: string;
  support: string;
  highlight: boolean;
  gradient: string;
  deliverables: string[];
  outcomes: string[];
  cta: string;
}

export interface MatrixRow {
  label: string;
  category: string;
  leadflow: boolean | "partial";
  growthWeb: boolean | "partial";
  customSoft: boolean | "partial";
  enterprise: boolean | "partial";
}

export interface IncludedItem {
  icon: string;
  title: string;
  description: string;
}

export interface PricingFAQItem {
  q: string;
  a: string;
}

export const engagementModels: EngagementModel[] = [
  {
    id: "leadflow",
    name: "LeadFlow AI",
    tagline: "Deploy an AI receptionist that qualifies leads and books appointments around the clock.",
    idealFor: "Service businesses receiving 10+ weekly inquiries who want automated lead capture without a full software build.",
    price: "$299",
    priceNote: "per month",
    deliveryTime: "2–3 weeks",
    support: "Standard — email & chat",
    highlight: false,
    gradient: "from-brand-blue/8 via-brand-indigo/5 to-brand-violet/8",
    deliverables: [
      "Custom-trained AI conversation agent",
      "Embeddable website widget",
      "Google Calendar & Outlook integration",
      "Business OS pipeline dashboard",
      "CRM webhook integration",
      "Monthly performance report",
    ],
    outcomes: [
      "24/7 lead qualification without staff",
      "Automatic appointment booking",
      "Structured lead data in your CRM",
    ],
    cta: "Deploy LeadFlow",
  },
  {
    id: "growth-web",
    name: "Growth Website",
    tagline: "A precision-engineered website built to convert visitors into booked consultations.",
    idealFor: "Businesses whose current website fails to generate leads or doesn't reflect the quality of their service.",
    price: "$4,500",
    priceNote: "one-time",
    deliveryTime: "3–4 weeks",
    support: "30-day post-launch support",
    highlight: false,
    gradient: "from-emerald-50 via-teal-50 to-cyan-50",
    deliverables: [
      "100% custom React + TypeScript build",
      "LeadFlow AI widget pre-integrated",
      "Perfect 100/100 Core Web Vitals",
      "Mobile-first responsive design",
      "Technical SEO structure",
      "30-day support and tuning window",
    ],
    outcomes: [
      "4× higher conversion vs template sites",
      "Sub-second load times",
      "Immediate lead capture on launch",
    ],
    cta: "Start Web Project",
  },
  {
    id: "custom-soft",
    name: "Custom Software",
    tagline: "Purpose-built business systems that automate your specific workflow end-to-end.",
    idealFor: "Growing businesses operating on disconnected spreadsheets, legacy tools, or manual processes that limit scale.",
    price: "From $8,000",
    priceNote: "milestone-based",
    deliveryTime: "6–10 weeks",
    support: "90-day post-launch SLA",
    highlight: true,
    gradient: "from-brand-indigo/8 via-brand-violet/5 to-violet-50",
    deliverables: [
      "Full architecture and system design",
      "Custom database and API layer",
      "Admin portal and internal dashboards",
      "Third-party API integrations",
      "Automated test coverage",
      "Full IP transfer on completion",
    ],
    outcomes: [
      "All operations unified in one system",
      "80% reduction in manual admin time",
      "Scales without adding headcount",
    ],
    cta: "Scope Your Project",
  },
  {
    id: "enterprise",
    name: "Enterprise Partnership",
    tagline: "A long-term engineering partner embedded in your business — strategy, build, and optimization.",
    idealFor: "Businesses with ongoing software needs, multiple products in development, or complex AI integration requirements.",
    price: "Custom",
    priceNote: "monthly retainer",
    deliveryTime: "Ongoing",
    support: "Priority — dedicated Slack channel",
    highlight: false,
    gradient: "from-brand-navy/5 via-brand-slate-100 to-brand-slate-50",
    deliverables: [
      "Unlimited strategic consulting sessions",
      "Priority development capacity",
      "Continuous AI model optimization",
      "Monthly architecture reviews",
      "Dedicated project Slack channel",
      "Quarterly business impact reports",
    ],
    outcomes: [
      "Technology roadmap aligned to growth",
      "Continuous product iteration",
      "Senior engineering team on demand",
    ],
    cta: "Discuss Partnership",
  },
];

export const matrixRows: MatrixRow[] = [
  { label: "Discovery & Audit",         category: "Process",     leadflow: "partial", growthWeb: true,      customSoft: true,    enterprise: true    },
  { label: "Strategy & Architecture",   category: "Process",     leadflow: false,     growthWeb: "partial", customSoft: true,    enterprise: true    },
  { label: "UI/UX Design",              category: "Process",     leadflow: false,     growthWeb: true,      customSoft: true,    enterprise: true    },
  { label: "Custom Development",        category: "Process",     leadflow: false,     growthWeb: true,      customSoft: true,    enterprise: true    },
  { label: "QA & Testing",              category: "Process",     leadflow: false,     growthWeb: "partial", customSoft: true,    enterprise: true    },
  { label: "Deployment & Launch",       category: "Process",     leadflow: true,      growthWeb: true,      customSoft: true,    enterprise: true    },
  { label: "Ongoing Support",           category: "Support",     leadflow: "partial", growthWeb: "partial", customSoft: "partial",enterprise: true   },
  { label: "Continuous Optimization",  category: "Support",     leadflow: false,     growthWeb: false,     customSoft: false,   enterprise: true    },
  { label: "AI Agent Integration",      category: "AI",          leadflow: true,      growthWeb: true,      customSoft: "partial",enterprise: true   },
  { label: "Workflow Automation",       category: "AI",          leadflow: "partial", growthWeb: false,     customSoft: true,    enterprise: true    },
  { label: "Business Dashboard",        category: "AI",          leadflow: true,      growthWeb: false,     customSoft: true,    enterprise: true    },
  { label: "Team Training & Docs",      category: "Support",     leadflow: false,     growthWeb: false,     customSoft: true,    enterprise: true    },
];

export const includedItems: IncludedItem[] = [
  { icon: "Search",      title: "Dedicated Discovery",     description: "Every engagement begins with a structured audit of your workflow, bottlenecks, and technical environment." },
  { icon: "Map",         title: "Architecture Planning",   description: "We design the full system architecture before writing a single line of production code." },
  { icon: "Calendar",    title: "Project Roadmap",         description: "A milestone-based delivery plan with clear timelines, deliverables, and review checkpoints." },
  { icon: "MessageCircle", title: "Weekly Progress Updates", description: "Transparent weekly check-ins. You always know where the project stands." },
  { icon: "ShieldCheck", title: "Security Review",         description: "Input validation, encryption, and vulnerability checks are part of every build — not an add-on." },
  { icon: "Rocket",      title: "Managed Launch",          description: "Staged rollout with monitoring, instant rollback, and a go-live checklist to ensure zero downtime." },
  { icon: "FileText",    title: "Full Documentation",      description: "Clean technical documentation and code comments delivered with every project." },
  { icon: "HeartHandshake", title: "Post-Launch Support",  description: "Support window included on every project. We don't disappear after delivery." },
];

export const pricingFaqs: PricingFAQItem[] = [
  {
    q: "How long does a typical project take?",
    a: "LeadFlow deploys in 2–3 weeks. Growth Websites take 3–4 weeks. Custom software ranges from 6–10 weeks depending on scope. Enterprise partnerships operate on a continuous development cycle with monthly milestones.",
  },
  {
    q: "Can we start with LeadFlow and expand later?",
    a: "Absolutely. Many clients start with LeadFlow to generate immediate ROI, then commission a custom website or software system once they've seen results. There's no lock-in and each engagement is independent.",
  },
  {
    q: "How does billing work for custom projects?",
    a: "Custom software projects use a milestone-based structure — you pay in phases tied to delivery checkpoints. This keeps risk low and ensures you see working software at each stage before the next phase begins.",
  },
  {
    q: "Does LeadFlow integrate with our existing CRM?",
    a: "Yes. LeadFlow ships with native connectors for HubSpot, Salesforce, and Zapier, plus a generic webhook endpoint for any platform with a REST API. Custom integrations are available as part of the setup.",
  },
  {
    q: "Do we own the code built for our project?",
    a: "Yes, fully. Upon final milestone completion, all intellectual property and source code is transferred to your organization's GitHub or preferred environment. No licensing fees, no lock-in.",
  },
  {
    q: "What if our requirements change mid-project?",
    a: "We operate in short, reviewable sprints. Scope changes are evaluated at sprint boundaries. Minor adjustments are absorbed; significant additions are scoped and priced transparently before work begins.",
  },
];
