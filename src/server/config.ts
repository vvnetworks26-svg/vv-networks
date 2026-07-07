import dotenv from "dotenv";
dotenv.config();

export const config = {
  port:              parseInt(process.env.PORT ?? "3000", 10),
  geminiApiKey:      process.env.GEMINI_API_KEY ?? "",
  corsOrigin:        process.env.CORS_ORIGIN ?? "*",
  nodeEnv:           process.env.NODE_ENV ?? "development",
  mongoUri:          process.env.MONGODB_URI ?? "",
  jwtSecret:         process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  jwtAccessExpiry:   process.env.JWT_ACCESS_EXPIRY  ?? "15m",
  jwtRefreshExpiry:  process.env.JWT_REFRESH_EXPIRY ?? "30d",
  bcryptRounds:      parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10),
  rateLimitMax:      parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),
} as const;
