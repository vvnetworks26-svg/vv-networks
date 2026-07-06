import { api } from "../apiClient";
import type { Message, MessageRole } from "./types";

/** Transport abstraction — swapped in Phase D for LeadFlow API transport. */
export interface Transport {
  sendMessage(text: string, history: Message[]): Promise<string>;
}

/** Demo transport — calls the existing Gemini proxy on /api/leadflow/chat */
export const demoTransport: Transport = {
  async sendMessage(text: string, history: Message[]): Promise<string> {
    const apiHistory = history.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      content: m.content,
    }));
    const result = await api.chat(text, apiHistory);
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
