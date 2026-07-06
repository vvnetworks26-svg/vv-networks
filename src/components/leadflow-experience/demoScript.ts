import type { ConversationMessage, QualificationChip, DemoStep, AppointmentData } from "./types";

export const conversationScript: ConversationMessage[] = [
  { id: "m1", role: "leadflow", content: "Hi! I'm here to help. What brings you to our site today?", timestamp: 0 },
  { id: "m2", role: "visitor", content: "My AC stopped working and it's 105° outside.", timestamp: 1200 },
  { id: "m3", role: "leadflow", content: "I'm sorry to hear that. Is there no cooling at all, or is there reduced airflow?", timestamp: 2400 },
  { id: "m4", role: "visitor", content: "No cooling at all. Just warm air blowing.", timestamp: 3600 },
  { id: "m5", role: "leadflow", content: "Got it. What's your ZIP code so I can check our service availability?", timestamp: 4800 },
  { id: "m6", role: "visitor", content: "85004", timestamp: 5400 },
  { id: "m7", role: "leadflow", content: "Perfect — we service Phoenix. Is this for a home or business?", timestamp: 6600 },
  { id: "m8", role: "visitor", content: "Home", timestamp: 7200 },
  { id: "m9", role: "leadflow", content: "How soon do you need this fixed? Today, tomorrow, or this week?", timestamp: 8400 },
  { id: "m10", role: "visitor", content: "Today if possible. It's unbearable.", timestamp: 9000 },
  { id: "m11", role: "leadflow", content: "I completely understand. We have a technician available this afternoon at 2:30 PM. Can I reserve that slot for you?", timestamp: 10200 },
  { id: "m12", role: "visitor", content: "Yes please!", timestamp: 10800 },
  { id: "m13", role: "leadflow", content: "Great! Just need your name and phone number to confirm the appointment.", timestamp: 12000 },
  { id: "m14", role: "visitor", content: "John Smith, 602-555-0147", timestamp: 12900 },
  { id: "m15", role: "leadflow", content: "Perfect! Your appointment is confirmed for today at 2:30 PM. Our technician will text you 30 minutes before arrival. You'll receive a confirmation email shortly. Is there anything else I can help with?", timestamp: 14100 },
  { id: "m16", role: "visitor", content: "No, that's perfect. Thank you!", timestamp: 15000 },
  { id: "m17", role: "leadflow", content: "You're welcome, John! We'll see you this afternoon. Stay cool! 🌟", timestamp: 16200 },
];

export const qualificationChips: QualificationChip[] = [
  { id: "q1", label: "Priority", value: "Emergency", order: 4800 },
  { id: "q2", label: "Location", value: "Phoenix, AZ", order: 6600 },
  { id: "q3", label: "Service", value: "AC Repair", order: 4800 },
  { id: "q4", label: "Property", value: "Residential", order: 8400 },
  { id: "q5", label: "Timeline", value: "Today", order: 10200 },
  { id: "q6", label: "Value", value: "$450–$850", order: 12000 },
];

export const appointmentData: AppointmentData = {
  customerName: "John Smith",
  service: "Emergency AC Repair",
  date: "Today",
  time: "2:30 PM",
  location: "Phoenix, AZ 85004",
  priority: "high",
  estimatedValue: "$650",
};
