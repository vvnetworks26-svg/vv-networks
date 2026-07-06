export interface BusinessProblem {
  id: string;
  title: string;
  description: string;
  icon: string;
  impact: string;
}

export interface Solution {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  gradient: string;
  problems: string[];
  capabilities: string[];
  outcomes: string[];
  pricing: string;
  deliveryTime: string;
}

export interface IndustrySolution {
  id: string;
  industry: string;
  icon: string;
  challenge: string;
  solution: string;
  outcome: string;
  gradient: string;
}

export interface TechnologyGroup {
  category: string;
  technologies: string[];
}

export interface TimelinePhase {
  step: string;
  title: string;
  description: string;
  duration: string;
}

export const businessProblems: BusinessProblem[] = [
  {
    id: "missed-leads",
    title: "Missed Opportunities",
    description: "Leads contact you outside business hours or during peak times. By the time you respond, they've chosen a competitor.",
    icon: "PhoneOff",
    impact: "Losing 30-40% of inbound leads",
  },
  {
    id: "slow-response",
    title: "Slow Response Time",
    description: "Manual follow-up processes mean hours or days pass before prospects hear back. Speed directly determines close rate.",
    icon: "Clock",
    impact: "Average 14-hour response delay",
  },
  {
    id: "manual-work",
    title: "Repetitive Administrative Work",
    description: "Staff spend hours each week on scheduling, data entry, and qualification calls that could be automated.",
    icon: "Repeat",
    impact: "20+ hours weekly on admin tasks",
  },
  {
    id: "disconnected-tools",
    title: "Disconnected Systems",
    description: "Customer data lives in spreadsheets, emails, and legacy software. Nothing syncs. Context is lost.",
    icon: "Link2Off",
    impact: "Manual re-entry causes 15-25% data errors",
  },
  {
    id: "poor-conversion",
    title: "Low Website Conversion",
    description: "Traffic arrives but doesn't convert. Generic contact forms create friction. No clear path to becoming a customer.",
    icon: "TrendingDown",
    impact: "Typical conversion rate under 3%",
  },
  {
    id: "no-automation",
    title: "Growth Blocked by Capacity",
    description: "Adding more customers means hiring more staff. Operations don't scale without increasing headcount proportionally.",
    icon: "AlertCircle",
    impact: "Cannot grow without hiring",
  },
];

export const solutions: Solution[] = [
  {
    id: "leadflow",
    name: "LeadFlow AI",
    tagline: "Autonomous lead qualification and booking — 24/7.",
    icon: "Bot",
    gradient: "from-brand-blue/10 via-brand-indigo/5 to-brand-violet/10",
    problems: ["Missed Opportunities", "Slow Response Time", "Low Website Conversion"],
    capabilities: [
      "Conversational AI qualification",
      "Real-time appointment booking",
      "CRM integration & data sync",
      "Business dashboard analytics",
      "Multi-channel deployment",
    ],
    outcomes: [
      "300% increase in lead conversion rate",
      "Under 2-minute response time",
      "Zero missed after-hours leads",
      "Automated calendar booking",
    ],
    pricing: "$299/month",
    deliveryTime: "2-3 weeks",
  },
  {
    id: "modern-websites",
    name: "High-Converting Websites",
    tagline: "Built for speed, optimized for conversion, engineered from first principles.",
    icon: "Globe",
    gradient: "from-emerald-50 via-teal-50 to-cyan-50",
    problems: ["Low Website Conversion", "Slow Response Time"],
    capabilities: [
      "100/100 Core Web Vitals score",
      "Custom React + TypeScript",
      "LeadFlow AI pre-integrated",
      "SEO-optimized structure",
      "Mobile-first responsive design",
    ],
    outcomes: [
      "Perfect Lighthouse performance",
      "4× higher conversion vs templates",
      "Sub-second page load",
      "Search engine authority boost",
    ],
    pricing: "$4,500 one-time",
    deliveryTime: "3-4 weeks",
  },
  {
    id: "custom-software",
    name: "Custom Business Software",
    tagline: "Purpose-built systems that automate your specific workflow.",
    icon: "Code",
    gradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    problems: ["Disconnected Systems", "Repetitive Administrative Work", "Growth Blocked by Capacity"],
    capabilities: [
      "Custom CRM & pipeline tools",
      "Internal dashboards & admin portals",
      "API integrations with legacy systems",
      "Automated workflow engines",
      "Scalable cloud architecture",
    ],
    outcomes: [
      "80% reduction in manual data entry",
      "All systems unified in one platform",
      "Real-time business visibility",
      "Scales without adding headcount",
    ],
    pricing: "Custom project pricing",
    deliveryTime: "6-10 weeks",
  },
  {
    id: "ai-automation",
    name: "AI & Workflow Automation",
    tagline: "Eliminate repetitive work with intelligent automation.",
    icon: "Zap",
    gradient: "from-amber-50 via-yellow-50 to-orange-50",
    problems: ["Repetitive Administrative Work", "Growth Blocked by Capacity"],
    capabilities: [
      "AI document processing",
      "Intelligent routing & qualification",
      "CRM auto-sync & enrichment",
      "Email & SMS automation",
      "Custom AI assistants",
    ],
    outcomes: [
      "40+ hours saved weekly",
      "99% accuracy on data extraction",
      "Zero manual follow-up required",
      "Business scales automatically",
    ],
    pricing: "Custom per workflow",
    deliveryTime: "4-6 weeks",
  },
];

export const industries: IndustrySolution[] = [
  {
    id: "hvac",
    industry: "HVAC",
    icon: "Wind",
    challenge: "Emergency service calls flood in during heat waves. Staff can't answer fast enough. Leads go to competitors.",
    solution: "LeadFlow AI qualifies urgency, location, and service type — then books the next available technician slot automatically.",
    outcome: "4× increase in after-hours bookings, zero missed emergency calls.",
    gradient: "from-sky-50 to-blue-100",
  },
  {
    id: "legal",
    industry: "Legal Services",
    icon: "Scale",
    challenge: "Initial consultations require manual scheduling across multiple attorneys. Process takes days. Prospects lose interest.",
    solution: "Automated consultation booking with attorney availability sync, conflict checks, and CRM integration.",
    outcome: "Consultation booking rate increased 65%, response time under 5 minutes.",
    gradient: "from-slate-50 to-slate-200",
  },
  {
    id: "real-estate",
    industry: "Real Estate",
    icon: "Home",
    challenge: "Agents manually follow up on property inquiries. Leads go cold while waiting for showing schedules.",
    solution: "AI-powered property recommendations, instant showing booking, and automated nurture sequences.",
    outcome: "Showing booking rate up 3×, agents focus on closings instead of admin.",
    gradient: "from-emerald-50 to-green-100",
  },
  {
    id: "restaurants",
    industry: "Restaurants",
    icon: "UtensilsCrossed",
    challenge: "Reservation calls interrupt kitchen operations. Online booking systems are clunky and lose reservations.",
    solution: "Custom reservation platform with real-time table management, automated confirmations, and no-show reduction.",
    outcome: "95% reservation accuracy, staff interruptions eliminated.",
    gradient: "from-rose-50 to-pink-100",
  },
  {
    id: "medical",
    industry: "Medical & Dental",
    icon: "Stethoscope",
    challenge: "Patient scheduling requires insurance verification and complex availability logic across multiple providers.",
    solution: "HIPAA-compliant booking system with insurance checks, provider availability, and automated appointment reminders.",
    outcome: "No-show rate reduced 40%, front desk admin time cut in half.",
    gradient: "from-cyan-50 to-teal-100",
  },
  {
    id: "construction",
    industry: "Construction",
    icon: "HardHat",
    challenge: "Estimate requests come in via phone, email, and web forms. Data is scattered. Follow-up is manual.",
    solution: "Unified estimate request system with automatic project scoping, material cost integration, and client portal.",
    outcome: "Estimate turnaround time reduced from 3 days to 4 hours.",
    gradient: "from-amber-50 to-yellow-100",
  },
];

export const technologyGroups: TechnologyGroup[] = [
  { category: "Frontend", technologies: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Vite"] },
  { category: "Backend", technologies: ["Node.js", "Python", "FastAPI", "Express", "Serverless"] },
  { category: "AI & ML", technologies: ["OpenAI", "Google Gemini", "Anthropic Claude", "Vector DBs", "LangChain"] },
  { category: "Databases", technologies: ["PostgreSQL", "MongoDB", "Redis", "Firestore", "Supabase"] },
  { category: "Cloud & DevOps", technologies: ["Vercel", "AWS", "GCP", "Docker", "GitHub Actions"] },
  { category: "Integrations", technologies: ["Google Calendar", "Stripe", "Twilio", "SendGrid", "Webhooks"] },
];

export const implementationPhases: TimelinePhase[] = [
  {
    step: "01",
    title: "Discovery",
    description: "We audit your workflow, identify bottlenecks, and map the operational process we're going to automate or optimize.",
    duration: "3-5 days",
  },
  {
    step: "02",
    title: "Strategy",
    description: "Technical architecture design, data flow diagrams, API specifications, and a milestone-based delivery plan.",
    duration: "5-7 days",
  },
  {
    step: "03",
    title: "Design",
    description: "High-fidelity UI mockups, user flows, and interactive prototypes reviewed with your team before development starts.",
    duration: "1-2 weeks",
  },
  {
    step: "04",
    title: "Development",
    description: "Sprint-based engineering with weekly demos. You see progress continuously — no black box development.",
    duration: "4-8 weeks",
  },
  {
    step: "05",
    title: "Testing",
    description: "Automated test coverage, load testing, security audits, and real-user acceptance testing before launch.",
    duration: "1 week",
  },
  {
    step: "06",
    title: "Launch",
    description: "Staged rollout with monitoring, instant rollback capability, and a go-live checklist to ensure zero downtime.",
    duration: "2-3 days",
  },
  {
    step: "07",
    title: "Optimization",
    description: "Post-launch tuning, performance monitoring, conversion analytics, and iterative improvements based on real usage data.",
    duration: "Ongoing",
  },
];
