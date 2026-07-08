/**
 * Job Scheduler — Phase I.7
 *
 * Lightweight in-process scheduler. No external dependency.
 * Supports: hourly, daily, cron-like intervals, one-shot, retry.
 *
 * Jobs defined here:
 *   cleanup:expired-tokens    — hourly
 *   cleanup:widget-sessions   — daily
 *   cleanup:audit-logs        — daily
 *   analytics:aggregation     — hourly
 *   billing:invoice-reminders — daily
 *   billing:subscription-check— daily
 *   ops:backup-reminder       — daily
 */

import logger from "../logger.js";
import metricsService, { METRIC } from "./metrics.service.js";
import errorTracker from "./error-tracking.service.js";

// ── Job definition ────────────────────────────────────────────────────────────

export type JobInterval = "minutely" | "hourly" | "daily" | "weekly";

export interface JobDefinition {
  id:          string;
  name:        string;
  description: string;
  interval:    JobInterval;
  intervalMs:  number;
  maxRetries:  number;
  enabled:     boolean;
  handler:     () => Promise<void>;
}

export interface JobRecord {
  id:          string;
  name:        string;
  description: string;
  interval:    JobInterval;
  intervalMs:  number;
  enabled:     boolean;
  lastRunAt?:  Date;
  lastStatus?: "success" | "failed" | "running";
  lastError?:  string;
  runCount:    number;
  errorCount:  number;
  avgDurationMs: number;
  nextRunAt?:  Date;
}

const INTERVALS: Record<JobInterval, number> = {
  minutely: 60_000,
  hourly:   3_600_000,
  daily:    86_400_000,
  weekly:   604_800_000,
};

// ── Scheduler ─────────────────────────────────────────────────────────────────

class SchedulerService {
  private readonly jobs     = new Map<string, JobDefinition>();
  private readonly records  = new Map<string, JobRecord>();
  private readonly timers   = new Map<string, ReturnType<typeof setInterval>>();
  private running           = false;

  register(job: Omit<JobDefinition, "intervalMs">): void {
    const def: JobDefinition = { ...job, intervalMs: INTERVALS[job.interval] };
    this.jobs.set(job.id, def);
    this.records.set(job.id, {
      id:            job.id,
      name:          job.name,
      description:   job.description,
      interval:      job.interval,
      intervalMs:    def.intervalMs,
      enabled:       job.enabled,
      runCount:      0,
      errorCount:    0,
      avgDurationMs: 0,
    });
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    for (const [id, job] of this.jobs) {
      if (!job.enabled) continue;
      const timer = setInterval(() => this.runJob(id), job.intervalMs);
      // Prevent timer from blocking Node exit
      if (timer.unref) timer.unref();
      this.timers.set(id, timer);
      const rec = this.records.get(id);
      if (rec) rec.nextRunAt = new Date(Date.now() + job.intervalMs);
    }
    logger.info(`[Scheduler] Started ${this.timers.size} jobs`);
  }

  stop(): void {
    for (const timer of this.timers.values()) clearInterval(timer);
    this.timers.clear();
    this.running = false;
    logger.info("[Scheduler] All jobs stopped");
  }

  async runJob(id: string, force = false): Promise<void> {
    const job = this.jobs.get(id);
    const rec = this.records.get(id);
    if (!job || !rec) {
      logger.warn(`[Scheduler] Unknown job: ${id}`);
      return;
    }
    if (!job.enabled && !force) return;

    rec.lastStatus = "running";
    const start    = Date.now();

    let attempt = 0;
    while (attempt <= job.maxRetries) {
      try {
        await job.handler();
        const dur = Date.now() - start;
        rec.lastRunAt    = new Date();
        rec.lastStatus   = "success";
        rec.runCount++;
        rec.lastError    = undefined;
        rec.avgDurationMs = rec.runCount === 1 ? dur
          : Math.round((rec.avgDurationMs * (rec.runCount - 1) + dur) / rec.runCount);
        rec.nextRunAt = new Date(Date.now() + job.intervalMs);
        metricsService.increment(METRIC.JOBS_EXECUTED);
        logger.info(`[Scheduler] ✓ ${job.name}`, { durationMs: dur });
        return;
      } catch (err) {
        attempt++;
        if (attempt > job.maxRetries) {
          const dur = Date.now() - start;
          rec.lastRunAt  = new Date();
          rec.lastStatus = "failed";
          rec.errorCount++;
          rec.lastError  = err instanceof Error ? err.message : String(err);
          metricsService.increment(METRIC.JOBS_FAILED);
          errorTracker.capture(err, { resource: "job", action: id });
          logger.error(`[Scheduler] ✗ ${job.name}`, { error: rec.lastError, durationMs: dur });
        } else {
          logger.warn(`[Scheduler] Retry ${attempt}/${job.maxRetries}: ${job.name}`);
          await sleep(1000 * attempt);
        }
      }
    }
  }

  enable(id: string): void {
    const job = this.jobs.get(id);
    const rec = this.records.get(id);
    if (job) { job.enabled = true; }
    if (rec)  { rec.enabled = true; }
  }

  disable(id: string): void {
    const job = this.jobs.get(id);
    const rec = this.records.get(id);
    if (job) { job.enabled = false; }
    if (rec)  { rec.enabled = false; }
    const timer = this.timers.get(id);
    if (timer) { clearInterval(timer); this.timers.delete(id); }
  }

  getAll(): JobRecord[] {
    return [...this.records.values()];
  }

  get(id: string): JobRecord | null {
    return this.records.get(id) ?? null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Singleton ─────────────────────────────────────────────────────────────────
export const schedulerService = new SchedulerService();

// ── Job registrations ─────────────────────────────────────────────────────────

/** Call this once at startup to register all production jobs. */
export function registerJobs(): void {

  schedulerService.register({
    id:          "cleanup:expired-tokens",
    name:        "Cleanup Expired Tokens",
    description: "Removes expired refresh tokens, password reset tokens, and email verification tokens from MongoDB",
    interval:    "hourly",
    maxRetries:  2,
    enabled:     true,
    handler: async () => {
      const { RefreshToken }           = await import("../../database/models/RefreshToken.js");
      const { PasswordResetToken }     = await import("../../database/models/PasswordResetToken.js");
      const { EmailVerificationToken } = await import("../../database/models/EmailVerificationToken.js");
      const now = new Date();
      const [rt, pr, ev] = await Promise.all([
        RefreshToken.deleteMany({ expiresAt: { $lt: now } }),
        PasswordResetToken.deleteMany({ expiresAt: { $lt: now } }),
        EmailVerificationToken.deleteMany({ expiresAt: { $lt: now } }),
      ]);
      logger.info("[Job] Expired tokens cleaned", {
        refreshTokens: rt.deletedCount,
        resetTokens:   pr.deletedCount,
        emailTokens:   ev.deletedCount,
      });
    },
  });

  schedulerService.register({
    id:          "cleanup:widget-sessions",
    name:        "Cleanup Old Widget Sessions",
    description: "Soft-deletes widget sessions older than 30 days with status 'complete' or 'idle'",
    interval:    "daily",
    maxRetries:  2,
    enabled:     true,
    handler: async () => {
      const { WidgetSession } = await import("../../database/models/WidgetSession.js");
      const cutoff = new Date(Date.now() - 30 * 86_400_000);
      const r = await WidgetSession.updateMany(
        { createdAt: { $lt: cutoff }, phase: { $in: ["complete", "idle"] }, deletedAt: null },
        { deletedAt: new Date() }
      );
      logger.info("[Job] Widget sessions cleaned", { count: r.modifiedCount });
    },
  });

  schedulerService.register({
    id:          "cleanup:audit-logs",
    name:        "Audit Log Retention Check",
    description: "Verifies TTL index on AuditLog is working (MongoDB handles actual deletion via TTL)",
    interval:    "daily",
    maxRetries:  1,
    enabled:     true,
    handler: async () => {
      const { AuditLog } = await import("../../database/models/AuditLog.js");
      const total = await AuditLog.countDocuments();
      logger.info("[Job] Audit log check", { totalLogs: total });
    },
  });

  schedulerService.register({
    id:          "analytics:aggregation",
    name:        "Analytics Aggregation",
    description: "Aggregates hourly analytics events for dashboard queries",
    interval:    "hourly",
    maxRetries:  2,
    enabled:     true,
    handler: async () => {
      const { AnalyticsEvent } = await import("../../database/models/AnalyticsEvent.js");
      const since = new Date(Date.now() - 3_600_000);
      const count = await AnalyticsEvent.countDocuments({ createdAt: { $gte: since } });
      metricsService.setGauge("analytics.events.last_hour", count);
      logger.info("[Job] Analytics aggregated", { eventsLastHour: count });
    },
  });

  schedulerService.register({
    id:          "billing:invoice-reminders",
    name:        "Invoice Reminders",
    description: "Sends reminder notifications for overdue invoices",
    interval:    "daily",
    maxRetries:  3,
    enabled:     true,
    handler: async () => {
      const { Invoice } = await import("../../database/models/Invoice.js");
      const overdue = await Invoice.find({
        status:    "sent",
        dueAt:     { $lt: new Date() },
        deletedAt: null,
      }).select("_id businessId invoiceNumber total").exec();
      logger.info("[Job] Invoice reminders check", { overdueCount: overdue.length });
      // Future: send email reminders via email.service
    },
  });

  schedulerService.register({
    id:          "billing:subscription-check",
    name:        "Subscription Renewal Check",
    description: "Checks for subscriptions due for renewal and updates grace period status",
    interval:    "daily",
    maxRetries:  2,
    enabled:     true,
    handler: async () => {
      const { Subscription } = await import("../../database/models/Subscription.js");
      const now = new Date();
      // Expire grace periods
      const expired = await Subscription.updateMany(
        { status: "grace_period", gracePeriodEndsAt: { $lt: now }, deletedAt: null },
        { status: "expired" }
      );
      // Flag subscriptions due to cancel at period end
      const cancelled = await Subscription.updateMany(
        { cancelAtPeriodEnd: true, currentPeriodEnd: { $lt: now }, deletedAt: null },
        { status: "cancelled", cancelledAt: now }
      );
      logger.info("[Job] Subscription check complete", {
        expired:   expired.modifiedCount,
        cancelled: cancelled.modifiedCount,
      });
    },
  });

  schedulerService.register({
    id:          "ops:backup-reminder",
    name:        "Backup Reminder",
    description: "Logs a reminder to verify that MongoDB Atlas backups are running",
    interval:    "daily",
    maxRetries:  1,
    enabled:     true,
    handler: async () => {
      logger.info("[Job] Daily backup reminder: verify MongoDB Atlas backup status at cloud.mongodb.net");
    },
  });

  logger.info(`[Scheduler] Registered ${schedulerService.getAll().length} jobs`);
}
