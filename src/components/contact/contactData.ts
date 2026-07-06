export type ProjectType =
  | "leadflow"
  | "website"
  | "custom-software"
  | "ai-automation"
  | "other";

export type BudgetRange =
  | "under-5k"
  | "5k-15k"
  | "15k-50k"
  | "50k-plus"
  | "ongoing"
  | "unsure";

export type Timeline =
  | "asap"
  | "1-3-months"
  | "3-6-months"
  | "6-plus-months"
  | "exploring";

export interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  projectType: ProjectType | "";
  budget: BudgetRange | "";
  timeline: Timeline | "";
  message: string;
  preferredContact: "email" | "phone" | "whatsapp";
  wantsLeadFlowDemo: boolean;
}

export interface ContactOption {
  id: string;
  icon: string;
  label: string;
  value: string;
  description: string;
  action: string;
  href: string;
}

export interface NextStep {
  step: string;
  title: string;
  duration: string;
  deliverables: string[];
  outcome: string;
  color: string;
}

export interface AgendaItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ContactFAQItem {
  q: string;
  a: string;
}

export const projectTypeOptions: Array<{
  value: ProjectType;
  label: string;
  icon: string;
  description: string;
}> = [
  { value: "leadflow",        label: "LeadFlow AI",       icon: "Bot",     description: "AI lead qualification widget" },
  { value: "website",         label: "Growth Website",    icon: "Globe",   description: "High-converting website" },
  { value: "custom-software", label: "Custom Software",   icon: "Code",    description: "Purpose-built business system" },
  { value: "ai-automation",   label: "AI Automation",     icon: "Zap",     description: "Workflow automation" },
  { value: "other",           label: "Something Else",    icon: "Layers",  description: "Tell us about it" },
];

export const budgetOptions: Array<{ value: BudgetRange; label: string }> = [
  { value: "under-5k",   label: "Under $5K"   },
  { value: "5k-15k",     label: "$5K – $15K"  },
  { value: "15k-50k",    label: "$15K – $50K" },
  { value: "50k-plus",   label: "$50K+"       },
  { value: "ongoing",    label: "Monthly"     },
  { value: "unsure",     label: "Not sure yet"},
];

export const timelineOptions: Array<{ value: Timeline; label: string }> = [
  { value: "asap",           label: "As soon as possible" },
  { value: "1-3-months",     label: "1 – 3 months"        },
  { value: "3-6-months",     label: "3 – 6 months"        },
  { value: "6-plus-months",  label: "6+ months"           },
  { value: "exploring",      label: "Just exploring"      },
];

export const contactOptions: ContactOption[] = [
  {
    id: "email",
    icon: "Mail",
    label: "Email",
    value: "vvnetworks26@gmail.com",
    description: "Best for detailed project briefs and technical enquiries.",
    action: "Send email",
    href: "mailto:vvnetworks26@gmail.com",
  },
  {
    id: "hours",
    icon: "Clock",
    label: "Business Hours",
    value: "Mon – Fri, 9 AM – 6 PM EST",
    description: "We respond to all enquiries within one business day.",
    action: "View availability",
    href: "#booking",
  },
  {
    id: "location",
    icon: "MapPin",
    label: "Location",
    value: "Remote-first studio",
    description: "We work with clients globally. Time zone is not a barrier.",
    action: "Learn about us",
    href: "#about",
  },
  {
    id: "response",
    icon: "Zap",
    label: "Response Time",
    value: "Under 24 hours",
    description: "Every enquiry is reviewed and acknowledged the same business day.",
    action: "Book directly",
    href: "#booking",
  },
];

export const nextSteps: NextStep[] = [
  {
    step: "01",
    title: "Book",
    duration: "2 minutes",
    deliverables: ["Strategy session confirmed", "Pre-session questionnaire sent", "Calendar invite issued"],
    outcome: "Your session is locked in. You know exactly what to expect.",
    color: "bg-brand-blue",
  },
  {
    step: "02",
    title: "Discovery",
    duration: "30 minutes",
    deliverables: ["Business goal mapping", "Bottleneck identification", "Technical environment review"],
    outcome: "A clear shared understanding of the problem and the opportunity.",
    color: "bg-brand-indigo",
  },
  {
    step: "03",
    title: "Proposal",
    duration: "1–2 business days",
    deliverables: ["Scoped solution overview", "Milestone-based pricing", "Delivery timeline"],
    outcome: "A transparent proposal you can review and revise at your own pace.",
    color: "bg-brand-violet",
  },
  {
    step: "04",
    title: "Kickoff",
    duration: "1 hour",
    deliverables: ["Final scope confirmation", "Team introductions", "Project workspace setup"],
    outcome: "Development begins with full alignment on goals and deliverables.",
    color: "bg-amber-500",
  },
  {
    step: "05",
    title: "Development",
    duration: "Project-dependent",
    deliverables: ["Weekly demos", "Version-controlled builds", "Continuous progress updates"],
    outcome: "Working software delivered incrementally. No surprises.",
    color: "bg-emerald-500",
  },
  {
    step: "06",
    title: "Launch",
    duration: "2–3 days",
    deliverables: ["Production deployment", "Performance monitoring", "Go-live support"],
    outcome: "Your system is live, stable, and generating value from day one.",
    color: "bg-teal-500",
  },
];

export const agendaItems: AgendaItem[] = [
  { id: "goals",       icon: "Target",        title: "Business Goals",          description: "What does success look like for your business in the next 12 months? We align our technical recommendations to your specific growth targets." },
  { id: "challenges",  icon: "AlertCircle",   title: "Current Challenges",      description: "Where is time or revenue being lost today? We map the specific operational bottlenecks your business faces." },
  { id: "growth",      icon: "TrendingUp",    title: "Growth Opportunities",    description: "Which parts of your business would benefit most from AI or automation? We identify high-impact areas early." },
  { id: "tech",        icon: "Cpu",           title: "Technology Assessment",   description: "What tools and systems do you currently use? We review your stack and identify integration or replacement opportunities." },
  { id: "solution",    icon: "Lightbulb",     title: "Recommended Solution",    description: "Based on everything we learn, we outline a tailored technical approach — not a generic pitch." },
  { id: "roadmap",     icon: "Map",           title: "Project Roadmap",         description: "We sketch a realistic timeline, phased milestones, and what the first deliverable looks like." },
  { id: "timeline",    icon: "Calendar",      title: "Estimated Timeline",      description: "You leave with a realistic sense of how long your project takes and when you'd see measurable results." },
  { id: "questions",   icon: "MessageCircle", title: "Your Questions",          description: "Dedicated time for any questions — technical, commercial, or strategic. Nothing is off the table." },
];

export const contactFaqs: ContactFAQItem[] = [
  {
    q: "How long is the strategy session?",
    a: "The initial session is 30 minutes. This gives us enough time to understand your business, identify the highest-impact opportunities, and outline a recommended approach — without wasting your time.",
  },
  {
    q: "Is the consultation free?",
    a: "Yes, completely. The strategy session is obligation-free. We use it to understand your business and determine whether we can genuinely help. If we can't, we'll tell you.",
  },
  {
    q: "Do I need technical knowledge to have a useful conversation?",
    a: "Not at all. We translate technical options into business outcomes. The most valuable sessions focus on your operations and goals — not on technology. We handle the technical translation.",
  },
  {
    q: "Can you work with clients internationally?",
    a: "Yes. We work with clients across time zones via video call. We've delivered projects for clients in North America, Europe, and beyond. Time zone is not a barrier.",
  },
  {
    q: "What happens after the meeting?",
    a: "Within one to two business days, you receive a written proposal covering the recommended solution, scoped deliverables, milestone-based pricing, and a realistic timeline. No pressure to proceed.",
  },
  {
    q: "Will I receive a formal proposal?",
    a: "Yes. Every strategy session concludes with a written proposal. It includes a clear scope of work, phased pricing structure, delivery timeline, and any open questions we need to resolve before starting.",
  },
];
