import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import logger from "../logger.js";

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
let clientKeySnapshot = "";   // tracks which key the client was built with

function getClient(): GoogleGenAI | null {
  if (!config.geminiApiKey) {
    logger.warn("[Gemini] GEMINI_API_KEY is not set — fallback response will be used");
    return null;
  }
  // Rebuild client if key changed (e.g. rotated via env var at runtime)
  if (!client || clientKeySnapshot !== config.geminiApiKey) {
    client = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: { headers: { "User-Agent": "vv-networks-leadflow" } },
    });
    clientKeySnapshot = config.geminiApiKey;
    logger.debug("[Gemini] Client initialised");
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
  history: ChatMessage[],
  correlationId?: string
): Promise<ChatResult> {
  const log = correlationId ? logger.child({ correlationId }) : logger;

  const ai = getClient();

  // Stage 3: log what is about to be sent to Gemini
  log.debug("[Gemini] Preparing request", {
    geminiConfigured: !!config.geminiApiKey,
    messageLen:       message.length,
    historyTurns:     history.length,
    history:          history.map((m) => ({ role: m.role, contentLen: m.content.length })),
    messageSample:    message.slice(0, 120),
  });

  if (!ai) {
    // Stage 5: fallback path — explain why
    log.warn("[Gemini] Using fallback response", {
      reason: "GEMINI_API_KEY not configured",
      fallback: true,
    });
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

  // Stage 3: log exact contents shape (no secrets)
  log.debug("[Gemini] Calling generateContent", {
    model:        "gemini-2.0-flash",
    contentTurns: contents.length,
    temperature:  0.7,
  });

  const start = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: LEADFLOW_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const durationMs = Date.now() - start;

    // Stage 4: log raw Gemini response
    log.info("[Gemini] Response received", {
      durationMs,
      textLen:     response.text?.length ?? 0,
      fallback:    false,
      // Sample first 120 chars of response — enough to confirm it's real AI output
      textSample:  response.text?.slice(0, 120) ?? "(empty)",
    });

    if (!response.text) {
      log.warn("[Gemini] Empty text in response", {
        rawResponse: JSON.stringify(response).slice(0, 300),
      });
    }

    return { text: response.text ?? "", fallback: false };

  } catch (err: unknown) {
    const durationMs = Date.now() - start;

    // Stage 4: log thrown error from Gemini SDK
    log.exception("[Gemini] generateContent threw an error", err, {
      durationMs,
      messageLen:   message.length,
      historyTurns: history.length,
    });

    // Stage 5: fallback fires because of SDK error
    log.warn("[Gemini] Using fallback response", {
      reason:   "Gemini SDK threw — see error above",
      fallback: true,
    });

    return {
      text: "We'd love to partner with you. Click 'Book Team Demo' to schedule a 15-minute founding team screen-share and we'll build a tailored solution for your requirements.",
      fallback: true,
    };
  }
}
