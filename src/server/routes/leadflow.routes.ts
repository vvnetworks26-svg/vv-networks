import { Router, Request, Response } from "express";
import { generateChatReply, ChatMessage } from "../services/gemini.service.js";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const { message, history } = req.body as {
    message?: string;
    history?: ChatMessage[];
  };

  if (!message || typeof message !== "string" || message.trim() === "") {
    res.status(400).json({ error: "message is required and must be a non-empty string" });
    return;
  }

  const safeHistory: ChatMessage[] = Array.isArray(history)
    ? history.filter(
        (m): m is ChatMessage =>
          m &&
          typeof m.content === "string" &&
          (m.role === "user" || m.role === "model")
      )
    : [];

  try {
    const result = await generateChatReply(message.trim(), safeHistory);
    res.json({ text: result.text, fallback: result.fallback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to generate response", details: message });
  }
});

export default router;
