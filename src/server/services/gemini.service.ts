import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

const LEADFLOW_SYSTEM_PROMPT = `You are "LeadFlow", the interactive, high-converting AI representative on the official website of VV Networks.

VV Networks is a premium AI software company and product studio. We build elite custom web applications, advanced AI workflows and agents, and intelligent automation systems for businesses.

LeadFlow is our flagship product: an intelligent conversational lead qualification widget that engages visitors, qualifies them, books calendar appointments, and writes structured records directly to CRM.

Your goals:
1. Greet visitors warmly and professionally.
2. Answer questions about VV Networks services: Custom Software, AI Automation, Web Development, Integrations, Cloud Architecture.
3. Answer questions about LeadFlow: it qualifies leads, books appointments, syncs to CRM, and increases conversion rates by 4×.
4. Qualify the prospect organically — ask what business they run, what operational bottleneck they face, and how they want to use AI.
5. Keep responses crisp: 2–4 sentences or a neat bullet block. Never write long corporate essays.
6. When they show interest, direct them to book a 15-minute founding team demo using the booking button on the page.

Be helpful, elegant, and outcome-focused.`;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!config.geminiApiKey) return null;
  if (!client) {
    client = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: { headers: { "User-Agent": "vv-networks-leadflow" } },
    });
  }
  return client;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatResult {
  text: string;
  fallback: boolean;
}

export async function generateChatReply(
  message: string,
  history: ChatMessage[]
): Promise<ChatResult> {
  const ai = getClient();

  if (!ai) {
    return {
      text: "We'd love to partner with you. Click 'Book Team Demo' to schedule a 15-minute founding team screen-share and we'll build a tailored solution for your requirements.",
      fallback: true,
    };
  }

  const contents = [
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction: LEADFLOW_SYSTEM_PROMPT,
      temperature: 0.7,
    },
  });

  return { text: response.text ?? "", fallback: false };
}
