/**
 * ErrorTrackingService — Phase I.7
 *
 * Provider-agnostic error tracking abstraction.
 *
 * Providers:
 *   ConsoleProvider  — default, logs to stdout/stderr
 *   SentryProvider   — stub, wired when SENTRY_DSN is set (future)
 *
 * Business logic never imports Sentry directly — only this service.
 */

import { config } from "../config.js";
import logger from "../logger.js";
import metricsService, { METRIC } from "./metrics.service.js";

// ── Provider interface ────────────────────────────────────────────────────────

export interface ErrorContext {
  userId?:        string;
  businessId?:    string;
  correlationId?: string;
  resource?:      string;
  action?:        string;
  tags?:          Record<string, string>;
  extra?:         Record<string, unknown>;
}

export interface IErrorProvider {
  readonly name: string;
  captureError(err: Error, ctx?: ErrorContext): void;
  captureMessage(message: string, level: "warning" | "error" | "fatal", ctx?: ErrorContext): void;
  setUser(userId: string, email?: string): void;
  flush?(): Promise<void>;
}

// ── ConsoleProvider ───────────────────────────────────────────────────────────

export class ConsoleProvider implements IErrorProvider {
  readonly name = "console";

  captureError(err: Error, ctx?: ErrorContext): void {
    logger.exception("[ErrorTracker] Captured error", err, ctx as Record<string, unknown>);
  }

  captureMessage(message: string, level: "warning" | "error" | "fatal", ctx?: ErrorContext): void {
    const lvl = level === "warning" ? "warn" : level;
    logger[lvl](`[ErrorTracker] ${message}`, ctx as Record<string, unknown>);
  }

  setUser(_userId: string, _email?: string): void {
    // no-op for console
  }
}

// ── SentryProvider (stub) ─────────────────────────────────────────────────────

export class SentryProvider implements IErrorProvider {
  readonly name = "sentry";

  // Future: import * as Sentry from "@sentry/node" and init here
  captureError(err: Error, ctx?: ErrorContext): void {
    // Sentry.withScope((scope) => {
    //   if (ctx?.userId) scope.setUser({ id: ctx.userId });
    //   if (ctx?.tags)   scope.setTags(ctx.tags);
    //   if (ctx?.extra)  scope.setExtras(ctx.extra);
    //   Sentry.captureException(err);
    // });
    logger.warn("[SentryProvider] Stub — set SENTRY_DSN to enable", {
      error: err.message,
      ...ctx,
    });
  }

  captureMessage(message: string, level: "warning" | "error" | "fatal", _ctx?: ErrorContext): void {
    logger.warn(`[SentryProvider] Stub message: ${message} (${level})`);
  }

  setUser(_userId: string, _email?: string): void { /* stub */ }

  async flush(): Promise<void> {
    // await Sentry.flush(2000);
  }
}

// ── ErrorTrackingService ──────────────────────────────────────────────────────

interface TrackedError {
  id:          string;
  message:     string;
  stack?:      string;
  context?:    ErrorContext;
  timestamp:   Date;
  count:       number;
  lastSeen:    Date;
}

class ErrorTrackingService {
  private provider: IErrorProvider;
  private readonly recent: Map<string, TrackedError> = new Map();
  private static readonly MAX_RECENT = 100;
  private errorCounter = 0;

  constructor() {
    // Auto-select provider
    this.provider = new ConsoleProvider();
    // Future: if (process.env.SENTRY_DSN) this.provider = new SentryProvider();
  }

  setProvider(p: IErrorProvider): void {
    this.provider = p;
    logger.info(`[ErrorTracker] Provider set: ${p.name}`);
  }

  capture(err: unknown, ctx?: ErrorContext): void {
    const error = err instanceof Error ? err : new Error(String(err));

    metricsService.increment(METRIC.HTTP_REQUESTS_ERRORS);
    this.errorCounter++;

    // Deduplicate by message fingerprint
    const fp = `${error.message.slice(0, 100)}:${ctx?.resource ?? ""}`;
    const existing = this.recent.get(fp);
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
    } else {
      if (this.recent.size >= ErrorTrackingService.MAX_RECENT) {
        // Evict oldest
        const firstKey = this.recent.keys().next().value;
        if (firstKey) this.recent.delete(firstKey);
      }
      this.recent.set(fp, {
        id:        `err_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        message:   error.message,
        stack:     config.isDev ? error.stack : undefined,
        context:   ctx,
        timestamp: new Date(),
        count:     1,
        lastSeen:  new Date(),
      });
    }

    this.provider.captureError(error, ctx);
  }

  captureMessage(message: string, level: "warning" | "error" | "fatal" = "error", ctx?: ErrorContext): void {
    this.provider.captureMessage(message, level, ctx);
  }

  getRecent(limit = 20): TrackedError[] {
    return [...this.recent.values()]
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
      .slice(0, limit);
  }

  getStats(): { total: number; uniqueErrors: number; topErrors: Array<{ message: string; count: number }> } {
    const sorted = [...this.recent.values()].sort((a, b) => b.count - a.count);
    return {
      total:        this.errorCounter,
      uniqueErrors: this.recent.size,
      topErrors:    sorted.slice(0, 5).map((e) => ({ message: e.message, count: e.count })),
    };
  }
}

export const errorTracker = new ErrorTrackingService();
export default errorTracker;
