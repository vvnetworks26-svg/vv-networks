export interface Principle {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ThinkingStep {
  step: string;
  title: string;
  what: string;
  why: string;
  outcome: string;
  color: string;
}

export interface EngineeringStandard {
  id: string;
  icon: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  badgeText: string;
  badgeColor: string;
}

export interface RetentionReason {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface BusinessMetric {
  id: string;
  value: string;
  numericTarget: number;
  suffix: string;
  label: string;
  explanation: string;
  color: string;
}

export const principles: Principle[] = [
  {
    id: "business-first",
    icon: "TrendingUp",
    title: "Business First",
    description: "Technology is the means, not the goal. Every decision — from architecture to UI — is evaluated by its impact on your business outcomes.",
  },
  {
    id: "build-for-scale",
    icon: "Layers",
    title: "Build for Scale",
    description: "We architect for where your business is going, not just where it is today. Systems that need to be rebuilt in 18 months aren't finished.",
  },
  {
    id: "engineering-excellence",
    icon: "Code",
    title: "Engineering Excellence",
    description: "Clean code, strict TypeScript, comprehensive tests, and honest documentation. Quality is a standard, not an option we sell at a higher tier.",
  },
  {
    id: "long-term-thinking",
    icon: "Compass",
    title: "Long-Term Thinking",
    description: "We optimise for the relationship that outlasts the first project. The best work happens when both parties invest in understanding each other.",
  },
  {
    id: "continuous-improvement",
    icon: "RefreshCw",
    title: "Continuous Improvement",
    description: "Software is never finished. We build measurement into every system so we can identify friction and improve it with data, not guesswork.",
  },
  {
    id: "obsess-over-quality",
    icon: "Star",
    title: "Obsess Over Quality",
    description: "We don't ship software we wouldn't use ourselves. High standards aren't a project overhead — they're why clients return.",
  },
];

export const thinkingSteps: ThinkingStep[] = [
  {
    step: "01",
    title: "Understand",
    what: "We start by listening. Deeply. We map your workflow, identify where time and revenue are lost, and understand what success actually looks like for your business.",
    why: "Most software fails not because of bad code — but because no one truly understood the problem being solved.",
    outcome: "A shared, documented understanding of the problem worth solving.",
    color: "bg-brand-blue",
  },
  {
    step: "02",
    title: "Design",
    what: "Before writing a line of production code, we design the architecture, data flow, and user experience. High-fidelity prototypes are reviewed with your team.",
    why: "Changing a design costs hours. Changing production code costs weeks. We front-load clarity.",
    outcome: "A system design and user flow your team has approved and understands.",
    color: "bg-brand-indigo",
  },
  {
    step: "03",
    title: "Build",
    what: "Sprint-based development with weekly demos. You see working software at every stage. Nothing ships to production without tests and a review.",
    why: "Transparency during development prevents expensive surprises at delivery.",
    outcome: "A working, tested system delivered incrementally — no black box.",
    color: "bg-brand-violet",
  },
  {
    step: "04",
    title: "Measure",
    what: "After launch, we instrument the system for real usage data. Conversion rates, response times, error rates, and user behaviour are tracked from day one.",
    why: "You can't improve what you can't measure. Intuition is useful — data is better.",
    outcome: "A live performance baseline that makes every future decision evidence-based.",
    color: "bg-amber-500",
  },
  {
    step: "05",
    title: "Improve",
    what: "We use real usage data to identify friction, prioritise iterations, and compound the value of the system over time. The first version is never the last.",
    why: "A system that improves continuously becomes a durable competitive advantage.",
    outcome: "A software asset that gets more valuable as your business grows.",
    color: "bg-emerald-500",
  },
];

export const engineeringStandards: EngineeringStandard[] = [
  {
    id: "performance",
    icon: "Gauge",
    title: "Performance",
    description: "Sub-second load times, optimised render cycles, and Core Web Vitals targets built into every frontend project.",
    metric: "100",
    metricLabel: "Lighthouse target",
    badgeText: "Always measured",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "security",
    icon: "ShieldCheck",
    title: "Security",
    description: "Parameterised queries, input validation, encrypted pipelines, and principle-of-least-privilege access by default.",
    metric: "0",
    metricLabel: "Tolerance for security shortcuts",
    badgeText: "Non-negotiable",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "accessibility",
    icon: "Eye",
    title: "Accessibility",
    description: "WCAG 2.1 AA compliance, keyboard navigation, semantic HTML, and ARIA labels on every component we ship.",
    metric: "AA",
    metricLabel: "WCAG compliance level",
    badgeText: "Standard",
    badgeColor: "bg-brand-blue/5 text-brand-blue border-brand-blue/20",
  },
  {
    id: "maintainability",
    icon: "GitBranch",
    title: "Maintainability",
    description: "Strict TypeScript, consistent code style, documented decisions, and architecture that new engineers can understand on day one.",
    metric: "0",
    metricLabel: "Tolerance for 'any' types",
    badgeText: "Enforced",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "scalability",
    icon: "BarChart3",
    title: "Scalability",
    description: "Database indexes, caching layers, and auto-scaling infrastructure. Built to handle 10× your current load from day one.",
    metric: "10×",
    metricLabel: "Designed headroom",
    badgeText: "Architected in",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "testing",
    icon: "CheckCircle2",
    title: "Testing",
    description: "Unit, integration, and end-to-end tests with meaningful coverage. Every critical path is tested before anything ships.",
    metric: "CI",
    metricLabel: "Automated on every push",
    badgeText: "Automated",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
  },
];

export const retentionReasons: RetentionReason[] = [
  {
    id: "communication",
    icon: "MessageCircle",
    title: "Fast, clear communication",
    description: "We respond within 24 hours, every time. You'll never send a message and wonder if anyone read it.",
  },
  {
    id: "transparent",
    icon: "Eye",
    title: "Transparent process",
    description: "You have visibility into every phase. Scope, progress, blockers, and decisions are shared openly — not hidden behind a status page.",
  },
  {
    id: "weekly-updates",
    icon: "Calendar",
    title: "Weekly progress updates",
    description: "Every week, you receive a structured update: what was built, what's next, and anything you need to review or decide.",
  },
  {
    id: "no-surprises",
    icon: "ShieldCheck",
    title: "No surprises",
    description: "If scope changes, we tell you immediately. If something takes longer, you hear about it before a deadline is missed.",
  },
  {
    id: "optimisation",
    icon: "TrendingUp",
    title: "Continuous optimisation",
    description: "We don't disappear after launch. Post-delivery, we analyse real usage data and suggest improvements based on what's actually happening.",
  },
  {
    id: "partnership",
    icon: "HeartHandshake",
    title: "Long-term partnership",
    description: "We invest in understanding your business deeply. Clients who've worked with us once consistently come back because the relationship compounds over time.",
  },
];

export const businessMetrics: BusinessMetric[] = [
  {
    id: "custom",
    value: "100%",
    numericTarget: 100,
    suffix: "%",
    label: "Custom solutions",
    explanation: "Every system we build is written from scratch for your specific workflow. We have never used a generic template.",
    color: "text-brand-blue",
  },
  {
    id: "response",
    value: "24hr",
    numericTarget: 24,
    suffix: "hr",
    label: "Maximum response target",
    explanation: "We respond to every client message within 24 hours. This is a commitment, not an aspiration.",
    color: "text-brand-indigo",
  },
  {
    id: "templates",
    value: "0",
    numericTarget: 0,
    suffix: "",
    label: "Template websites delivered",
    explanation: "We have never sold a Wix, Squarespace, or WordPress site. Every project is engineered from the ground up.",
    color: "text-brand-violet",
  },
  {
    id: "improvements",
    value: "∞",
    numericTarget: 0,
    suffix: "",
    label: "Long-term improvements",
    explanation: "There is no limit on how many iterations a Technology Partner client can commission. We keep building as long as there's value to create.",
    color: "text-emerald-600",
  },
];
