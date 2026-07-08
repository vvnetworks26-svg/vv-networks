import { api } from "../apiClient";
import type { Message } from "./types";

/** Transport abstraction — swapped in Phase D for LeadFlow API transport. */
export interface Transport {
  sendMessage(text: string, history: Message[]): Promise<string>;
}

/** Demo transport — calls the Gemini proxy on /api/leadflow/chat */
export const demoTransport: Transport = {
  async sendMessage(text: string, history: Message[]): Promise<string> {
    // ── Stage 1: log exact payload being sent from the frontend ──────────────
    // Uses console.debug so it appears in browser DevTools → Console
    // and in server-side logs when running in dev (tsx server.ts).
    const apiHistory = history.map((m) => ({
      // Fix: map "assistant" → "model" so the backend filter accepts it.
      // The Message type uses role:"assistant" but the Gemini API uses "model".
      role:    (m.role === "assistant" ? "model" : m.role) as "user" | "model",
      content: m.content,
    }));

    if (typeof window !== "undefined") {
      // Browser context — DevTools console
      console.debug("[LeadFlow:transport] Sending to /api/leadflow/chat", {
        messageLen:    text.length,
        messageSample: text.slice(0, 120),
        historyTurns:  apiHistory.length,
        roles:         apiHistory.map((m) => m.role),
      });
    }

    const result = await api.chat(text, apiHistory);

    // ── Stage 6 (client side): log response from API ──────────────────────
    if (typeof window !== "undefined") {
      console.debug("[LeadFlow:transport] Response from /api/leadflow/chat", {
        fallback:    result.fallback,
        textLen:     result.text.length,
        textSample:  result.text.slice(0, 120),
      });
    }

    return result.text;
  },
};

/** Production transport stub — replace body of sendMessage in Phase D */
export const productionTransport: Transport = {
  async sendMessage(text: string, history: Message[]): Promise<string> {
    // Phase D: call LeadFlow API with session token, thread ID, webhook URL
    return demoTransport.sendMessage(text, history);
  },
};
