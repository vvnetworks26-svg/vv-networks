export interface Message {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: Date;
}

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  category: string;
  tagline: string;
  problem: string;
  solution: string;
  technology: string[];
  outcome: string;
  metric: string;
  metricLabel: string;
  image: string; // Use elegant abstract patterns or illustrative SVGs
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  outcomes: string[];
  duration: string;
  icon: string; // lucide icon name
  badge?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  price: string;
  billing: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  company: string;
  date: string;
  time: string;
  notes?: string;
  timestamp: string;
}
