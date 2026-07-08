/**
 * FeatureFlagService — Phase I.7
 *
 * Supports:
 *   - Boolean flags (on/off)
 *   - Percentage rollout (0–100)
 *   - Business-specific overrides
 *   - User-specific overrides
 *   - Environment-scoped defaults
 *   - Remote provider interface (future: LaunchDarkly, Flagsmith)
 */

import { createHash } from "crypto";
import { config } from "../config.js";
import logger from "../logger.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FlagDefinition {
  key:         string;
  description: string;
  defaultValue:boolean;
  rolloutPct?: number;                          // 0-100, enables for that % of users
  envOverrides?:Partial<Record<string, boolean>>;  // { production: false, development: true }
  businessOverrides?: Record<string, boolean>; // { "businessId": true }
  userOverrides?:     Record<string, boolean>; // { "userId": false }
  tags?:       string[];
  updatedAt:   Date;
}

export interface EvalContext {
  userId?:     string;
  businessId?: string;
  env?:        string;
}

// ── Default flags ─────────────────────────────────────────────────────────────

const DEFAULT_FLAGS: FlagDefinition[] = [
  {
    key: "billing.stripe",
    description: "Enable live Stripe payment processing",
    defaultValue: false,
    envOverrides: { development: false, staging: false, production: false },
    tags: ["billing", "stripe"],
    updatedAt: new Date(),
  },
  {
    key: "billing.subscriptions",
    description: "Enable subscription creation via API",
    defaultValue: true,
    tags: ["billing"],
    updatedAt: new Date(),
  },
  {
    key: "leadflow.widget",
    description: "Enable LeadFlow chat widget on the frontend",
    defaultValue: true,
    tags: ["leadflow"],
    updatedAt: new Date(),
  },
  {
    key: "leadflow.ai_chat",
    description: "Enable Gemini AI in LeadFlow widget",
    defaultValue: true,
    tags: ["leadflow", "ai"],
    updatedAt: new Date(),
  },
  {
    key: "maintenance.enabled",
    description: "Global maintenance mode toggle",
    defaultValue: false,
    tags: ["operations"],
    updatedAt: new Date(),
  },
  {
    key: "analytics.dashboard",
    description: "Enable operational analytics dashboard",
    defaultValue: true,
    tags: ["analytics"],
    updatedAt: new Date(),
  },
  {
    key: "jobs.cleanup",
    description: "Enable background cleanup jobs",
    defaultValue: true,
    tags: ["jobs"],
    updatedAt: new Date(),
  },
  {
    key: "jobs.invoice_reminders",
    description: "Enable automated invoice reminder jobs",
    defaultValue: false,
    envOverrides: { production: true },
    tags: ["jobs", "billing"],
    updatedAt: new Date(),
  },
  {
    key: "operations.audit_dashboard",
    description: "Enable audit log dashboard API",
    defaultValue: true,
    tags: ["operations", "audit"],
    updatedAt: new Date(),
  },
];

// ── FeatureFlagService ────────────────────────────────────────────────────────

class FeatureFlagService {
  private flags = new Map<string, FlagDefinition>();

  constructor() {
    for (const f of DEFAULT_FLAGS) {
      this.flags.set(f.key, { ...f });
    }
  }

  /** Returns all flags (stripped of internal override maps for API response) */
  getAll(): FlagDefinition[] {
    return [...this.flags.values()];
  }

  getFlag(key: string): FlagDefinition | null {
    return this.flags.get(key) ?? null;
  }

  /** Evaluate a flag for a specific context */
  evaluate(key: string, ctx: EvalContext = {}): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;

    // 1. User override (highest priority)
    if (ctx.userId && flag.userOverrides?.[ctx.userId] !== undefined) {
      return flag.userOverrides[ctx.userId]!;
    }

    // 2. Business override
    if (ctx.businessId && flag.businessOverrides?.[ctx.businessId] !== undefined) {
      return flag.businessOverrides[ctx.businessId]!;
    }

    // 3. Environment override
    const env = ctx.env ?? config.nodeEnv;
    if (flag.envOverrides?.[env] !== undefined) {
      return flag.envOverrides[env]!;
    }

    // 4. Percentage rollout (deterministic via hash)
    if (flag.rolloutPct !== undefined && flag.rolloutPct < 100) {
      const seed = `${key}:${ctx.userId ?? ctx.businessId ?? "anonymous"}`;
      const hash = parseInt(createHash("md5").update(seed).digest("hex").slice(0, 8), 16);
      const bucket = (hash % 100) + 1;   // 1-100
      return bucket <= flag.rolloutPct;
    }

    return flag.defaultValue;
  }

  /** Upsert a flag (creates or updates) */
  upsert(key: string, patch: Partial<Omit<FlagDefinition, "key" | "updatedAt">>): FlagDefinition {
    const existing = this.flags.get(key);
    const updated: FlagDefinition = {
      key,
      description:       patch.description       ?? existing?.description ?? key,
      defaultValue:      patch.defaultValue       ?? existing?.defaultValue ?? false,
      rolloutPct:        patch.rolloutPct         ?? existing?.rolloutPct,
      envOverrides:      patch.envOverrides       ?? existing?.envOverrides,
      businessOverrides: patch.businessOverrides  ?? existing?.businessOverrides,
      userOverrides:     patch.userOverrides      ?? existing?.userOverrides,
      tags:              patch.tags               ?? existing?.tags ?? [],
      updatedAt: new Date(),
    };
    this.flags.set(key, updated);
    logger.info(`[FeatureFlags] Updated: ${key}`, { defaultValue: updated.defaultValue });
    return updated;
  }

  /** Shorthand: toggle a flag on/off globally */
  toggle(key: string, value: boolean): FlagDefinition {
    return this.upsert(key, { defaultValue: value });
  }

  isEnabled(key: string, ctx?: EvalContext): boolean {
    return this.evaluate(key, ctx);
  }
}

export const featureFlagService = new FeatureFlagService();
export default featureFlagService;
