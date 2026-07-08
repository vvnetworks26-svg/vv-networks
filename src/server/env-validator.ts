/**
 * Environment Validator — Phase I.6
 *
 * Validates required environment variables at startup.
 * Prints a clear, actionable error and exits on failure in production.
 * Warns (never blocks) in development.
 */

import { config } from "./config.js";

interface EnvRule {
  key:      string;
  required: "always" | "production" | "optional";
  description: string;
  validate?: (v: string) => boolean;
  validationMessage?: string;
}

const RULES: EnvRule[] = [
  // ── Core ──────────────────────────────────────────────────────────────────
  {
    key: "NODE_ENV",
    required: "always",
    description: "Runtime environment",
    validate: (v) => ["development","staging","production","test"].includes(v),
    validationMessage: "Must be one of: development, staging, production, test",
  },
  {
    key: "JWT_SECRET",
    required: "production",
    description: "JWT signing secret (min 32 chars)",
    validate: (v) => v.length >= 32 && v !== "dev-secret-change-in-production",
    validationMessage: "Must be at least 32 characters and not the default placeholder. Generate: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
  },

  // ── Database ──────────────────────────────────────────────────────────────
  {
    key: "MONGODB_URI",
    required: "production",
    description: "MongoDB Atlas connection string",
    validate: (v) => v.startsWith("mongodb"),
    validationMessage: "Must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)",
  },

  // ── Stripe ────────────────────────────────────────────────────────────────
  {
    key: "STRIPE_SECRET_KEY",
    required: "optional",
    description: "Stripe secret key (sk_live_... or sk_test_...)",
    validate: (v) => v.startsWith("sk_"),
    validationMessage: "Must start with sk_live_ or sk_test_",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    required: "optional",
    description: "Stripe webhook signing secret (whsec_...)",
    validate: (v) => v.startsWith("whsec_"),
    validationMessage: "Must start with whsec_",
  },

  // ── App ───────────────────────────────────────────────────────────────────
  {
    key: "APP_URL",
    required: "production",
    description: "Public URL of this service (e.g. https://vv-networks.onrender.com)",
    validate: (v) => v.startsWith("http"),
    validationMessage: "Must be a full URL starting with http:// or https://",
  },
  {
    key: "CORS_ORIGIN",
    required: "production",
    description: "Allowed CORS origin(s) — must not be wildcard (*) in production",
    validate: (v) => config.isProd ? v !== "*" : true,
    validationMessage: "Must not be '*' in production. Set to your Vercel domain.",
  },

  // ── Optional but validated if present ────────────────────────────────────
  {
    key: "BCRYPT_ROUNDS",
    required: "optional",
    description: "bcrypt work factor (10–14 recommended)",
    validate: (v) => { const n = parseInt(v, 10); return n >= 8 && n <= 20; },
    validationMessage: "Must be an integer between 8 and 20",
  },
];

export interface ValidationResult {
  valid:    boolean;
  errors:   string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors:   string[] = [];
  const warnings: string[] = [];
  const isProd = config.isProd || config.isStage;

  for (const rule of RULES) {
    const value = process.env[rule.key];

    // Check presence
    const isRequired = rule.required === "always" || (rule.required === "production" && isProd);

    if (!value || value.trim() === "") {
      if (isRequired) {
        errors.push(`[MISSING] ${rule.key} — ${rule.description}`);
      } else if (rule.required !== "optional" || rule.key === "STRIPE_SECRET_KEY") {
        warnings.push(`[OPTIONAL] ${rule.key} not set — ${rule.description}`);
      }
      continue;
    }

    // Check format/value
    if (rule.validate && !rule.validate(value)) {
      const msg = `[INVALID] ${rule.key} — ${rule.validationMessage ?? "Invalid value"}`;
      if (isRequired) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Runs environment validation at startup.
 * In production: exits the process on any error.
 * In development: logs warnings, never blocks.
 */
export function assertEnvironment(): void {
  const result = validateEnvironment();
  const label  = "[ENV]";

  if (result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.warn(`${label} ${w}`);
    }
  }

  if (!result.valid) {
    console.error(`\n${label} ─────────────────────────────────────────────`);
    console.error(`${label} STARTUP FAILED: Invalid environment configuration`);
    console.error(`${label} ─────────────────────────────────────────────`);
    for (const e of result.errors) {
      console.error(`${label} ${e}`);
    }
    console.error(`${label} ─────────────────────────────────────────────`);
    console.error(`${label} Fix these issues before starting in production.`);
    console.error(`${label} See docs/ENVIRONMENT.md for full reference.\n`);

    if (config.isProd || config.isStage) {
      process.exit(1);
    } else {
      console.warn(`${label} Running in development — env errors above are non-fatal.\n`);
    }
  } else {
    const envDisplay = config.nodeEnv.toUpperCase().padEnd(12);
    console.info(`${label} ✓ Environment validated [${envDisplay}] ${result.warnings.length > 0 ? `(${result.warnings.length} warnings)` : ""}`);
  }
}
