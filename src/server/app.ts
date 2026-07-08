import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { connectDatabase, ensureIndexes } from "../database/index.js";
import { requestLogger } from "./middleware/request-logger.js";
import { globalErrorHandler } from "./middleware/error-handler.js";
import { maintenanceGuard } from "./middleware/maintenance.js";
import logger from "./logger.js";

// Routes
import monitoringRouter from "./routes/monitoring.routes.js";
import webhookRouter    from "./routes/webhooks.routes.js";
import healthRouter     from "./routes/health.routes.js";       // legacy
import leadflowRouter   from "./routes/leadflow.routes.js";
import bookingRouter    from "./routes/booking.routes.js";
import v1Router         from "./api/routes/v1.js";
import authRouter       from "./api/routes/auth.js";

export async function initDatabase(): Promise<void> {
  await connectDatabase();
  if (config.mongoUri) await ensureIndexes();
}

export function createApp() {
  const app = express();

  // ── Trust proxy (required for correct IP behind Render / Vercel) ──────────
  if (config.trustProxy) {
    app.set("trust proxy", 1);
  }

  // ── Compression ───────────────────────────────────────────────────────────
  if (config.compressionEnabled) {
    app.use(compression());
  }

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: config.isProd ? {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'"],   // Vite inlines scripts
        styleSrc:    ["'self'", "'unsafe-inline'"],
        imgSrc:      ["'self'", "data:", "https:"],
        connectSrc:  ["'self'", "https://api.stripe.com"],
        frameSrc:    ["'none'"],
        objectSrc:   ["'none'"],
        upgradeInsecureRequests: [],
      },
    } : false,
  }));

  // ── CORS ──────────────────────────────────────────────────────────────────
  const corsOrigins = config.corsOrigin === "*"
    ? "*"
    : config.corsOrigin.split(",").map((o) => o.trim());

  app.use(cors({
    origin:       corsOrigins,
    methods:      ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization", "X-Correlation-Id", "Stripe-Signature"],
    exposedHeaders:["X-Correlation-Id"],
    credentials:  true,
    maxAge:       86400,
  }));

  // ── Global rate limit ─────────────────────────────────────────────────────
  app.use(rateLimit({
    windowMs:       config.rateLimitWindowMs,
    max:            config.rateLimitMax,
    standardHeaders:true,
    legacyHeaders:  false,
    skip:           () => config.isDev,
    message:        { success: false, error: "Too many requests", code: "RATE_LIMITED" },
    // Use X-Forwarded-For behind proxy
    keyGenerator:   (req) => (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown",
  }));

  // ── Request logging + correlation IDs ────────────────────────────────────
  app.use(requestLogger);

  // ── Maintenance mode guard ─────────────────────────────────────────────────
  app.use(maintenanceGuard);

  // ── Webhooks (raw body — MUST be before express.json()) ──────────────────
  app.use("/api/webhooks", webhookRouter);

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  // ── Monitoring endpoints ──────────────────────────────────────────────────
  app.use("/api", monitoringRouter);

  // ── Legacy routes (frontend depends on these — preserved) ────────────────
  app.use("/api/health",   healthRouter);
  app.use("/api/leadflow", leadflowRouter);
  app.use("/api/bookings", bookingRouter);

  // ── REST API v1 ───────────────────────────────────────────────────────────
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1",      v1Router);

  // ── Global error handler (must be last) ──────────────────────────────────
  app.use(globalErrorHandler);

  logger.info("[App] Express application configured", {
    env:         config.nodeEnv,
    compression: config.compressionEnabled,
    trustProxy:  config.trustProxy,
    corsOrigin:  config.corsOrigin,
  });

  return app;
}
