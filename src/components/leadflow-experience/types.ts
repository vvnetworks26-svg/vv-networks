export interface ConversationMessage {
  id: string;
  role: "visitor" | "leadflow";
  content: string;
  timestamp: number;
}

export interface QualificationChip {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  icon: string;
  color: string;
}

export interface DemoStep {
  id: string;
  type: "message" | "qualification" | "dashboard" | "appointment" | "notification" | "outcome";
  delay: number;
  data?: any;
}

export interface AppointmentData {
  customerName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  priority: "high" | "medium" | "low";
  estimatedValue: string;
}
