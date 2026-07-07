import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { connectDatabase, ensureIndexes } from "../database/index.js";
import healthRouter from "./routes/health.routes.js";
import leadflowRouter from "./routes/leadflow.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import v1Router from "./api/routes/v1.js";

export async function initDatabase(): Promise<void> {
  await connectDatabase();
  if (config.mongoUri) await ensureIndexes();
}

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50kb" }));
  app.use(
    cors({
      origin: config.corsOrigin,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Legacy routes (preserved — frontend depends on these)
  app.use("/api/health",    healthRouter);
  app.use("/api/leadflow",  leadflowRouter);
  app.use("/api/bookings",  bookingRouter);

  // v1 REST API
  app.use("/api/v1", v1Router);

  return app;
}
