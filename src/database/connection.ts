import mongoose from "mongoose";
import { config } from "../server/config.js";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let isConnected = false;

const MONGOOSE_OPTS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

async function connectWithRetry(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri, MONGOOSE_OPTS);
    isConnected = true;
    console.info(`[MongoDB] Connected (attempt ${attempt})`);
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.error("[MongoDB] Max retries reached. Could not connect.", err);
      throw err;
    }
    console.warn(`[MongoDB] Connection failed (attempt ${attempt}). Retrying in ${RETRY_DELAY_MS}ms…`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
}

export async function connectDatabase(): Promise<void> {
  if (!config.mongoUri) {
    console.warn("[MongoDB] MONGODB_URI not set — running without database (in-memory mode).");
    return;
  }
  if (isConnected) return;

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err);
    isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Disconnected.");
    isConnected = false;
  });

  await connectWithRetry();
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  console.info("[MongoDB] Connection closed.");
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function databaseHealthCheck(): Promise<{ connected: boolean; readyState: number; host: string }> {
  return {
    connected: isDatabaseConnected(),
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host ?? "not connected",
  };
}

// Graceful shutdown hooks
process.on("SIGINT",  async () => { await disconnectDatabase(); process.exit(0); });
process.on("SIGTERM", async () => { await disconnectDatabase(); process.exit(0); });
