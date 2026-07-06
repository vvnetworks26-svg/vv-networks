export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export type QualificationKey =
  | "businessType"
  | "companySize"
  | "projectGoal"
  | "budget"
  | "timeline"
  | "demoRequested"
  | "strategySessionRequested";

export interface QualificationState {
  score: number; // 0–100
  chips: Partial<Record<QualificationKey, string>>;
}

export type SessionPhase =
  | "idle"
  | "greeting"
  | "qualifying"
  | "solution"
  | "booking"
  | "complete";

export interface SessionState {
  id: string;
  phase: SessionPhase;
  messages: Message[];
  qualification: QualificationState;
  appointmentRequested: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}

// ── SDK Events ────────────────────────────────────────────────────────────────

export type LeadFlowEventName =
  | "widget:opened"
  | "widget:closed"
  | "conversation:started"
  | "conversation:completed"
  | "message:sent"
  | "message:received"
  | "qualification:updated"
  | "appointment:requested"
  | "lead:captured"
  | "demo:requested";

export interface LeadFlowEvent<T = unknown> {
  name: LeadFlowEventName;
  payload: T;
  timestamp: Date;
}

export type EventHandler<T = unknown> = (event: LeadFlowEvent<T>) => void;

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface AnalyticsSnapshot {
  widgetOpenCount: number;
  totalMessages: number;
  completionRate: number;
  ctaClicks: number;
  demoRequests: number;
  bookingRequests: number;
}
