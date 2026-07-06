import type { QualificationState, QualificationKey } from "./types";
import { eventBus } from "./eventBus";

const KEYWORD_MAP: Array<{
  key: QualificationKey;
  patterns: RegExp[];
  extractor: (text: string) => string | null;
}> = [
  {
    key: "businessType",
    patterns: [/(?:run|own|have|operate|manage)(?:\s+\w+)?\s+(company|business|firm|agency|clinic|practice|restaurant|shop|store)/i, /(?:i(?:'m| am) (?:a|an) )(\w+(?:\s+\w+)?)/i],
    extractor: (t) => {
      const m = t.match(/\b(hvac|plumber|plumbing|roofing|roofer|restaurant|legal|lawyer|real estate|medical|dental|construction|contractor|agency)\b/i);
      return m ? m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() : null;
    },
  },
  {
    key: "budget",
    patterns: [/\$[\d,]+k?/i, /budget/i, /spend/i],
    extractor: (t) => {
      const m = t.match(/\$\s*(\d[\d,.]*)\s*k?/i);
      if (m) return `$${m[1]}${t.toLowerCase().includes("k") ? "K" : ""}`;
      if (/under.{0,20}\$?5/i.test(t)) return "Under $5K";
      if (/\$5.{0,5}15/i.test(t) || /5k.{0,5}15/i.test(t)) return "$5K–$15K";
      if (/\$15.{0,5}50/i.test(t) || /15k.{0,5}50/i.test(t)) return "$15K–$50K";
      if (/\$50/i.test(t) || /50k/i.test(t)) return "$50K+";
      return null;
    },
  },
  {
    key: "timeline",
    patterns: [/asap|immediately|urgent|soon|month|week|year/i],
    extractor: (t) => {
      if (/asap|immediately|urgent|right away/i.test(t)) return "ASAP";
      if (/\d+\s*week/i.test(t)) return t.match(/(\d+)\s*week/i)?.[1] + " weeks";
      if (/\d+\s*month/i.test(t)) return t.match(/(\d+)\s*month/i)?.[1] + " months";
      if (/this month|next month/i.test(t)) return "This month";
      if (/this year|next year/i.test(t)) return "This year";
      if (/exploring|not sure|just looking/i.test(t)) return "Exploring";
      return null;
    },
  },
  {
    key: "demoRequested",
    patterns: [/demo|show me|see it|trial|try/i],
    extractor: () => "Yes",
  },
  {
    key: "strategySessionRequested",
    patterns: [/book|schedule|call|meet|appointment|session|consult/i],
    extractor: () => "Yes",
  },
  {
    key: "projectGoal",
    patterns: [/automate|automation|leads?|website|software|crm|booking|schedule|qualify/i],
    extractor: (t) => {
      if (/automat/i.test(t)) return "Automation";
      if (/lead|qualify/i.test(t)) return "Lead Qualification";
      if (/website|site/i.test(t)) return "Website";
      if (/software|system|platform|dashboard/i.test(t)) return "Custom Software";
      if (/booking|schedule|appointment/i.test(t)) return "Booking System";
      if (/crm/i.test(t)) return "CRM";
      return null;
    },
  },
];

const WEIGHTS: Record<QualificationKey, number> = {
  businessType: 20,
  projectGoal: 25,
  budget: 20,
  timeline: 15,
  companySize: 5,
  demoRequested: 10,
  strategySessionRequested: 5,
};

export function extractQualification(
  text: string,
  current: QualificationState
): QualificationState {
  const newChips = { ...current.chips };
  let changed = false;

  for (const rule of KEYWORD_MAP) {
    if (newChips[rule.key]) continue; // already captured
    const matched = rule.patterns.some((p) => p.test(text));
    if (!matched) continue;
    const value = rule.extractor(text);
    if (value) {
      newChips[rule.key] = value;
      changed = true;
    }
  }

  if (!changed) return current;

  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    if (newChips[key as QualificationKey]) score += weight;
  }

  const next: QualificationState = { score: Math.min(score, 100), chips: newChips };
  eventBus.track("qualification:updated", next);
  return next;
}

export function initialQualification(): QualificationState {
  return { score: 0, chips: {} };
}
