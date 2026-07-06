import { Router } from "express";
import mongoose from "mongoose";
import { config } from "../config.js";

const router = Router();

router.get("/", (_req, res) => {
  const readyState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const connected = readyState === 1;

  res.json({
    status: "ok",
    service: "vv-networks-api",
    env: config.nodeEnv,
    gemini: config.geminiApiKey ? "configured" : "missing",
    database: {
      connected,
      state: ["disconnected", "connected", "connecting", "disconnecting"][readyState] ?? "unknown",
      host: connected ? mongoose.connection.host : "not configured",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
