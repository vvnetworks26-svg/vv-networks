import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { connectDatabase, ensureIndexes, databaseHealthCheck } from "../database/index.js";
import healthRouter from "./routes/health.routes.js";
import leadflowRouter from "./routes/leadflow.routes.js";
import bookingRouter from "./routes/booking.routes.js";

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
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use("/api/health", healthRouter);
  app.use("/api/leadflow", leadflowRouter);
  app.use("/api/bookings", bookingRouter);

  return app;
}
