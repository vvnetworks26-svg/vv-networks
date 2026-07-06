/** Deployment mode. Switch to "production" once Phase D backend is connected. */
export type LeadFlowMode = "demo" | "production";

export interface LeadFlowConfig {
  /** Business identifier shown in developer overlay */
  businessId: string;
  /** Display name used in widget header */
  businessName: string;
  /** Accent hex colour — defaults to VV Networks brand-blue */
  accentColor: string;
  /** Widget position */
  position: "bottom-right" | "bottom-left";
  /** Light or dark widget theme */
  theme: "light" | "dark" | "auto";
  /** SDK version string */
  version: string;
  /** "demo" uses the existing Gemini proxy; "production" will use LeadFlow API */
  mode: LeadFlowMode;
  /** Initial greeting message */
  greeting: string;
  /** Widget launcher label (screen reader) */
  launcherLabel: string;
}

export const defaultConfig: LeadFlowConfig = {
  businessId: "vv-networks-demo",
  businessName: "VV Networks",
  accentColor: "#2563EB",
  position: "bottom-right",
  theme: "auto",
  version: "1.0.0",
  mode: "demo",
  greeting:
    "Hi! I'm LeadFlow, the AI agent for VV Networks. I can answer questions about our services, help scope your project, and book a strategy session. What brings you here today?",
  launcherLabel: "Open LeadFlow chat",
};
