import { Router, Request, Response } from "express";
import { generateChatReply, ChatMessage } from "../services/gemini.service.js";
import logger from "../logger.js";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const correlationId = (req as any).correlationId as string | undefined;
  const log = correlationId ? logger.child({ correlationId }) : logger;

  // ── Stage 2: log exact body received by Express ───────────────────────────
  const { message, history } = req.body as {
    message?: string;
    history?: unknown[];
  };

  log.debug("[LeadFlow] Request body received", {
    hasMessage:    message !== undefined,
    messageType:   typeof message,
    messageLen:    typeof message === "string" ? message.length : null,
    messageSample: typeof message === "string" ? message.slice(0, 120) : null,
    historyType:   Array.isArray(history) ? "array" : typeof history,
    historyLen:    Array.isArray(history) ? history.length : null,
  });

  if (!message || typeof message !== "string" || message.trim() === "") {
    log.warn("[LeadFlow] Validation failed — message missing or empty", {
      messageValue: message,
    });
    res.status(400).json({ error: "message is required and must be a non-empty string" });
    return;
  }

  // ── Bug fix: accept both "model" AND "assistant" roles in history ──────────
  // The frontend Message type uses role: "assistant", but the Gemini API uses
  // role: "model". The original filter only kept "user" | "model", silently
  // dropping every assistant turn from history. Fixed: accept "assistant" too,
  // then normalise it to "model" for Gemini.
  const safeHistory: ChatMessage[] = Array.isArray(history)
    ? history
        .filter(
          (m): m is { role: string; content: string } =>
            m !== null &&
            typeof m === "object" &&
            typeof (m as any).content === "string" &&
            ["user", "model", "assistant"].includes((m as any).role)
        )
        .map((m) => ({
          role:    (m.role === "assistant" ? "model" : m.role) as "user" | "model",
          content: m.content,
        }))
    : [];

  log.debug("[LeadFlow] History after sanitise", {
    originalLen: Array.isArray(history) ? history.length : 0,
    sanitisedLen: safeHistory.length,
    // Log roles to confirm no turns were lost
    roles: safeHistory.map((m) => m.role),
  });

  // ── Stage 3 onwards: delegate to gemini.service (which logs internally) ───
  try {
    const result = await generateChatReply(message.trim(), safeHistory, correlationId);

    // ── Stage 6: log what is returned to the frontend ─────────────────────
    log.info("[LeadFlow] Response sent to client", {
      fallback:    result.fallback,
      textLen:     result.text.length,
      textSample:  result.text.slice(0, 120),
    });

    res.json({ text: result.text, fallback: result.fallback });

  } catch (err: unknown) {
    // generateChatReply no longer throws (it returns fallback on error),
    // but guard here anyway so the route never crashes silently.
    log.exception("[LeadFlow] Unexpected error in chat route", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to generate response", details: msg });
  }
});

export default router;
