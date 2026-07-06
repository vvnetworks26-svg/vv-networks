import express from "express";
import cors from "cors";
import { config } from "./config.js";
import healthRouter from "./routes/health.routes.js";
import leadflowRouter from "./routes/leadflow.routes.js";
import bookingRouter from "./routes/booking.routes.js";

export function createApp() {
  const app = express();

  // ── Middleware ──────────────────────────────────────────────
  app.use(express.json({ limit: "50kb" }));
  app.use(
    cors({
      origin: config.corsOrigin,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Routes ──────────────────────────────────────────────────
  app.use("/api/health", healthRouter);
  app.use("/api/leadflow", leadflowRouter);
  app.use("/api/bookings", bookingRouter);

  return app;
}
