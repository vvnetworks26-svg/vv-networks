import { Router } from "express";
import { config } from "../config.js";
import { databaseHealthCheck } from "../../database/connection.js";

const router = Router();

router.get("/", async (_req, res) => {
  const db = await databaseHealthCheck();
  res.json({
    status: "ok",
    service: "vv-networks-api",
    env: config.nodeEnv,
    gemini: config.geminiApiKey ? "configured" : "missing",
    database: {
      connected: db.connected,
      host: db.connected ? db.host : "not configured",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
