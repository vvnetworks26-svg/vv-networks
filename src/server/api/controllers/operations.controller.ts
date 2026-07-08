/**
 * Operations Controller — Phase I.7
 *
 * GET  /operations/dashboard    — full operational dashboard
 * GET  /operations/system       — system health + metrics
 * GET  /operations/errors       — error tracking summary
 * GET  /operations/jobs         — background job status
 * GET  /operations/metrics      — raw metrics snapshot
 * GET  /operations/activity     — recent activity feed
 * GET  /operations/performance  — API performance stats
 * GET  /operations/audit        — audit log search
 * GET  /operations/audit/users  — per-user audit activity
 * GET  /operations/status       — maintenance status
 * PATCH /operations/status      — update maintenance mode
 * GET  /operations/features     — all feature flags
 * PATCH /operations/features/:key — update a feature flag
 * POST /operations/alerts/test  — fire a test alert
 */

import type { Request, Response } from "express";
import os from "os";
import mongoose from "mongoose";
import { ok, serverError, badRequest, notFound } from "../response.js";
import { getBid } from "../middleware.js";
import metricsService, { METRIC } from "../../services/metrics.service.js";
import performanceService from "../../services/performance.service.js";
import errorTracker from "../../services/error-tracking.service.js";
import { schedulerService } from "../../services/scheduler.service.js";
import featureFlagService from "../../services/feature-flags.service.js";
import { maintenanceService } from "../../services/maintenance.service.js";
import { alertService } from "../../services/alert.service.js";
import { databaseHealthCheck } from "../../../database/connection.js";
import { auditLogRepository } from "../../../database/repositories/AuditLogRepository.js";
import { config } from "../../config.js";

// ── Shared helpers ────────────────────────────────────────────────────────────

const serverStart = Date.now();

function uptimeSeconds(): number {
  return Math.round((Date.now() - serverStart) / 1000);
}

function memoryMB() {
  const m = process.memoryUsage();
  const mb = (n: number) => Math.round(n / 1024 / 1024 * 100) / 100;
  return { rss: mb(m.rss), heapUsed: mb(m.heapUsed), heapTotal: mb(m.heapTotal), external: mb(m.external) };
}

function eventLoopLag(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => resolve(Math.round(Number(process.hrtime.bigint() - start) / 1_000_000 * 10) / 10));
  });
}

// ── GET /operations/dashboard ─────────────────────────────────────────────────

export async function getDashboardHandler(req: Request, res: Response): Promise<void> {
  try {
    const [db, lag] = await Promise.all([databaseHealthCheck(), eventLoopLag()]);
    const mem       = memoryMB();
    const perf      = performanceService.getSummary();
    const errStats  = errorTracker.getStats();
    const jobs      = schedulerService.getAll();
    const metrics   = metricsService.snapshot();
    const alerts    = alertService.getHistory(10);

    // Trigger auto-check alerts
    await alertService.autoCheck({
      connected:  db.connected,
      readyState: db.readyState,
      heapUsedMB: mem.heapUsed,
      lagMs:      lag,
      errorRate:  perf.errorRate,
    });

    ok(res, {
      build: {
        service: config.appName,
        version: config.appVersion,
        env:     config.nodeEnv,
        commit:  config.gitCommit,
        uptime:  uptimeSeconds(),
        nodeVersion: process.version,
        pid:     process.pid,
        timestamp: new Date().toISOString(),
      },
      system: {
        database:   { connected: db.connected, host: db.host, readyState: db.readyState },
        memory:     mem,
        eventLoopLagMs: lag,
        cpus:       os.cpus().length,
        loadAvg:    os.loadavg().map((n) => Math.round(n * 100) / 100),
        platform:   process.platform,
      },
      api: {
        totalRequests:  metricsService.getCounter(METRIC.HTTP_REQUESTS_TOTAL),
        errors5xx:      metricsService.getCounter(METRIC.HTTP_5XX_TOTAL),
        errors4xx:      metricsService.getCounter(METRIC.HTTP_4XX_TOTAL),
        avgLatencyMs:   perf.avgLatencyMs,
        p95LatencyMs:   perf.p95LatencyMs,
        errorRate:      perf.errorRate,
        slowRequests:   perf.slowRequests,
      },
      auth: {
        logins:    metricsService.getCounter(METRIC.AUTH_LOGINS),
        failures:  metricsService.getCounter(METRIC.AUTH_FAILURES),
        registers: metricsService.getCounter(METRIC.AUTH_REGISTERS),
      },
      business: {
        leadsCreated:          metricsService.getCounter(METRIC.LEADS_CREATED),
        conversationsStarted:  metricsService.getCounter(METRIC.CONVERSATIONS_STARTED),
        appointmentsBooked:    metricsService.getCounter(METRIC.APPOINTMENTS_BOOKED),
        invoicesCreated:       metricsService.getCounter(METRIC.INVOICES_CREATED),
        invoicesPaid:          metricsService.getCounter(METRIC.INVOICES_PAID),
        paymentsRecorded:      metricsService.getCounter(METRIC.PAYMENTS_RECORDED),
        subscriptionsCreated:  metricsService.getCounter(METRIC.SUBSCRIPTIONS_CREATED),
        revenueCollectedCents: metricsService.getCounter(METRIC.REVENUE_COLLECTED_CENTS),
        widgetSessions:        metricsService.getCounter(METRIC.WIDGET_SESSIONS),
      },
      errors: {
        total:        errStats.total,
        uniqueErrors: errStats.uniqueErrors,
        topErrors:    errStats.topErrors,
        recentAlerts: alerts.slice(0, 5),
      },
      jobs: {
        total:   jobs.length,
        running: jobs.filter((j) => j.lastStatus === "running").length,
        failed:  jobs.filter((j) => j.lastStatus === "failed").length,
        list:    jobs,
      },
      webhooks: {
        total:  metricsService.getCounter(METRIC.WEBHOOK_EVENTS),
        errors: metricsService.getCounter(METRIC.WEBHOOK_ERRORS),
        stripe: metricsService.getCounter(METRIC.STRIPE_EVENTS),
      },
      maintenance: maintenanceService.getStatus(),
    });
  } catch (err) {
    serverError(res);
  }
}

// ── GET /operations/system ────────────────────────────────────────────────────

export async function getSystemHandler(_req: Request, res: Response): Promise<void> {
  try {
    const [db, lag] = await Promise.all([databaseHealthCheck(), eventLoopLag()]);
    ok(res, {
      database:   db,
      memory:     memoryMB(),
      cpu:        process.cpuUsage(),
      eventLoopLagMs: lag,
      system: {
        cpus:       os.cpus().length,
        loadAvg:    os.loadavg(),
        totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
        freeMemMB:  Math.round(os.freemem()  / 1024 / 1024),
        platform:   process.platform,
        arch:       process.arch,
      },
      process: {
        pid:     process.pid,
        uptime:  uptimeSeconds(),
        version: process.version,
        env:     config.nodeEnv,
      },
      mongoose: {
        poolSize: (mongoose.connection as any)?.pool?.totalConnectionCount ?? 0,
      },
    });
  } catch { serverError(res); }
}

// ── GET /operations/errors ────────────────────────────────────────────────────

export async function getErrorsHandler(_req: Request, res: Response): Promise<void> {
  try {
    ok(res, {
      stats:  errorTracker.getStats(),
      recent: errorTracker.getRecent(20),
      alerts: alertService.getHistory(20),
    });
  } catch { serverError(res); }
}

// ── GET /operations/jobs ──────────────────────────────────────────────────────

export async function getJobsHandler(_req: Request, res: Response): Promise<void> {
  try {
    ok(res, {
      jobs:    schedulerService.getAll(),
      summary: {
        total:    schedulerService.getAll().length,
        enabled:  schedulerService.getAll().filter((j) => j.enabled).length,
        failed:   schedulerService.getAll().filter((j) => j.lastStatus === "failed").length,
        executed: metricsService.getCounter(METRIC.JOBS_EXECUTED),
        errors:   metricsService.getCounter(METRIC.JOBS_FAILED),
      },
    });
  } catch { serverError(res); }
}

// ── POST /operations/jobs/:id/run ─────────────────────────────────────────────

export async function runJobHandler(req: Request, res: Response): Promise<void> {
  try {
    const job = schedulerService.get(req.params.id);
    if (!job) { notFound(res, "Job"); return; }
    // Run async — don't await in HTTP handler
    schedulerService.runJob(req.params.id, true).catch(() => {});
    ok(res, { triggered: true, jobId: req.params.id });
  } catch { serverError(res); }
}

// ── GET /operations/metrics ───────────────────────────────────────────────────

export async function getMetricsHandler(_req: Request, res: Response): Promise<void> {
  try {
    ok(res, metricsService.snapshot());
  } catch { serverError(res); }
}

// ── GET /operations/performance ───────────────────────────────────────────────

export async function getPerformanceHandler(_req: Request, res: Response): Promise<void> {
  try {
    ok(res, {
      summary:       performanceService.getSummary(),
      slowest:       performanceService.getSlowest(10),
      mostFrequent:  performanceService.getMostFrequent(10),
      highErrorRate: performanceService.getHighErrorRate(),
    });
  } catch { serverError(res); }
}

// ── GET /operations/activity ──────────────────────────────────────────────────

export async function getActivityHandler(req: Request, res: Response): Promise<void> {
  try {
    const businessId = getBid(req);
    const { limit = 20 } = req.query as any;
    const logs = await auditLogRepository.findFiltered({
      businessId,
      page: 1,
      limit: Math.min(+limit, 100),
    });
    ok(res, logs);
  } catch { serverError(res); }
}

// ── GET /operations/audit ─────────────────────────────────────────────────────

export async function getAuditHandler(req: Request, res: Response): Promise<void> {
  try {
    const businessId = getBid(req);
    const { page = 1, limit = 20, action, userId, resource, since, until } = req.query as any;
    const result = await auditLogRepository.findFiltered({
      businessId,
      userId,
      action,
      resource,
      since:  since  ? new Date(since)  : undefined,
      until:  until  ? new Date(until)  : undefined,
      page:   +page,
      limit:  Math.min(+limit, 100),
    });
    const stats = await auditLogRepository.getActionStats(businessId,
      since ? new Date(since) : new Date(Date.now() - 7 * 86_400_000)
    );
    ok(res, { ...result, actionStats: stats });
  } catch { serverError(res); }
}

// ── GET /operations/audit/users ───────────────────────────────────────────────

export async function getAuditUsersHandler(req: Request, res: Response): Promise<void> {
  try {
    const businessId = getBid(req);
    const { userId, page = 1, limit = 20 } = req.query as any;
    if (!userId) { badRequest(res, "userId query parameter is required"); return; }
    const result = await auditLogRepository.findFiltered({
      businessId,
      userId,
      page:  +page,
      limit: Math.min(+limit, 100),
    });
    ok(res, result);
  } catch { serverError(res); }
}

// ── GET /operations/audit/businesses ─────────────────────────────────────────

export async function getAuditBusinessesHandler(req: Request, res: Response): Promise<void> {
  try {
    const businessId = getBid(req);
    const { days = 7 } = req.query as any;
    const [stats, timeline] = await Promise.all([
      auditLogRepository.getActionStats(businessId),
      auditLogRepository.getActivityTimeline(businessId, +days),
    ]);
    ok(res, { businessId, actionStats: stats, activityTimeline: timeline });
  } catch { serverError(res); }
}

// ── GET /operations/status ────────────────────────────────────────────────────

export async function getStatusHandler(_req: Request, res: Response): Promise<void> {
  try {
    ok(res, maintenanceService.getStatus());
  } catch { serverError(res); }
}

// ── PATCH /operations/status ──────────────────────────────────────────────────

export async function updateStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const { enabled, message, estimatedCompletion, whitelist } = req.body as any;
    if (typeof enabled === "boolean") {
      if (enabled) {
        maintenanceService.enable({ message, estimatedCompletion, whitelist });
      } else {
        maintenanceService.disable();
      }
    } else {
      maintenanceService.update({ message, estimatedCompletion, whitelist });
    }
    ok(res, maintenanceService.getStatus());
  } catch { serverError(res); }
}

// ── GET /operations/features ──────────────────────────────────────────────────

export async function getFeaturesHandler(_req: Request, res: Response): Promise<void> {
  try {
    ok(res, featureFlagService.getAll());
  } catch { serverError(res); }
}

// ── PATCH /operations/features/:key ──────────────────────────────────────────

export async function updateFeatureHandler(req: Request, res: Response): Promise<void> {
  try {
    const { key } = req.params;
    const patch = req.body as Record<string, unknown>;
    const flag = featureFlagService.upsert(key, patch);
    ok(res, flag);
  } catch { serverError(res); }
}

// ── POST /operations/alerts/test ──────────────────────────────────────────────

export async function testAlertHandler(req: Request, res: Response): Promise<void> {
  try {
    const { severity = "warning", title = "Test Alert", message = "This is a test alert from the operations dashboard" } = req.body as any;
    const alert = await alertService.custom({ title, message, severity, trigger: "test" });
    ok(res, alert);
  } catch { serverError(res); }
}
