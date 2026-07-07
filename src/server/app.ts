import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { connectDatabase, ensureIndexes } from "../database/index.js";
import healthRouter from "./routes/health.routes.js";
import leadflowRouter from "./routes/leadflow.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import v1Router from "./api/routes/v1.js";
import authRouter from "./api/routes/auth.js";

export async function initDatabase(): Promise<void> {
  await connectDatabase();
  if (config.mongoUri) await ensureIndexes();
}

export function createApp() {
  const app = express();

  // ── Security headers ───────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // allow Vite iframe previews in dev
  }));

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "50kb" }));

  // ── Global rate limit ─────────────────────────────────────────────────────
  app.use(rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config.nodeEnv === "development",
    message: { success: false, error: "Too many requests", code: "RATE_LIMITED" },
  }));

  // ── Legacy routes (frontend depends on these — preserved) ─────────────────
  app.use("/api/health",   healthRouter);
  app.use("/api/leadflow", leadflowRouter);
  app.use("/api/bookings", bookingRouter);

  // ── REST API v1 ────────────────────────────────────────────────────────────
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1",      v1Router);

  return app;
}
