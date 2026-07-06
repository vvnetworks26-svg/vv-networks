import { Router } from "express";
import { config } from "../config.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "vv-networks-api",
    env: config.nodeEnv,
    gemini: config.geminiApiKey ? "configured" : "missing",
    timestamp: new Date().toISOString(),
  });
});

export default router;
