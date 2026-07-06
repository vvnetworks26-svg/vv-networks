import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
