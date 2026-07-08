import dotenv from "dotenv";
dotenv.config();

// ── Environment helpers ───────────────────────────────────────────────────────

type Env = "development" | "staging" | "production" | "test";

function env(key: string, fallback?: string): string {
  return process.env[key] ?? fallback ?? "";
}

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  const n = v !== undefined ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function envBool(key: string, fallback: boolean): boolean {
  const v = process.env[key];
  if (v === undefined) return fallback;
  return v === "true" || v === "1";
}

const nodeEnv = (env("NODE_ENV", "development")) as Env;
const isProd  = nodeEnv === "production";
const isStage = nodeEnv === "staging";

export const config = {
  // Core
  nodeEnv,
  isProd,
  isStage,
  isDev:    !isProd && !isStage,
  port:     envInt("PORT", 3000),

  // App identity
  appName:    env("APP_NAME", "vv-networks"),
  appVersion: env("APP_VERSION", "0.0.0"),
  appUrl:     env("APP_URL", "http://localhost:3000"),
  gitCommit:  env("GIT_COMMIT", "local"),

  // Database
  mongoUri: env("MONGODB_URI"),

  // Auth
  jwtSecret:       env("JWT_SECRET", "dev-secret-change-in-production"),
  jwtAccessExpiry: env("JWT_ACCESS_EXPIRY",  "15m"),
  jwtRefreshExpiry:env("JWT_REFRESH_EXPIRY", "30d"),
  bcryptRounds:    envInt("BCRYPT_ROUNDS", isProd ? 12 : 10),

  // CORS
  corsOrigin: env("CORS_ORIGIN", "*"),

  // Rate limiting
  rateLimitWindowMs: envInt("RATE_LIMIT_WINDOW_MS", 60_000),
  rateLimitMax:      envInt("RATE_LIMIT_MAX", isProd ? 100 : 1000),

  // Gemini
  geminiApiKey: env("GEMINI_API_KEY"),

  // Stripe (Phase I.6)
  stripeSecretKey:    env("STRIPE_SECRET_KEY"),
  stripeWebhookSecret:env("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey:env("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),

  // Logging
  logLevel: env("LOG_LEVEL", isProd ? "info" : "debug"),
  logFormat:env("LOG_FORMAT", isProd ? "json" : "pretty"),  // json | pretty

  // Monitoring
  metricsEnabled: envBool("METRICS_ENABLED", true),

  // Trust proxy (needed behind Render/Vercel load balancers)
  trustProxy: envBool("TRUST_PROXY", isProd || isStage),

  // Compression
  compressionEnabled: envBool("COMPRESSION_ENABLED", isProd),
} as const;

export type Config = typeof config;
