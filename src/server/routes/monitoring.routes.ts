/**
 * Monitoring Routes — Phase I.6
 *
 * GET /api/health      — full health check (DB, memory, uptime)
 * GET /api/ready       — readiness probe (is DB ready to serve traffic?)
 * GET /api/live        — liveness probe (is process alive?)
 * GET /api/metrics     — detailed system metrics
 */

import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import os from "os";
import { config } from "../config.js";
import { databaseHealthCheck } from "../../database/connection.js";

const router = Router();
const startTime = Date.now();

// ── Helpers ───────────────────────────────────────────────────────────────────

function uptimeSeconds(): number {
  return Math.round((Date.now() - startTime) / 1000);
}

function memoryMB(): { rss: number; heapUsed: number; heapTotal: number; external: number } {
  const m = process.memoryUsage();
  const mb = (n: number) => Math.round(n / 1024 / 1024 * 100) / 100;
  return {
    rss:       mb(m.rss),
    heapUsed:  mb(m.heapUsed),
    heapTotal: mb(m.heapTotal),
    external:  mb(m.external),
  };
}

function cpuUsage(): { user: number; system: number } {
  const c = process.cpuUsage();
  return {
    user:   Math.round(c.user   / 1000),  // microseconds → ms
    system: Math.round(c.system / 1000),
  };
}

/** Measures event loop lag by scheduling a setImmediate and timing the delay. */
function eventLoopLag(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1_000_000; // ns → ms
      resolve(Math.round(lag * 10) / 10);
    });
  });
}

// ── GET /api/health ───────────────────────────────────────────────────────────
router.get("/health", async (_req: Request, res: Response) => {
  const [db, lag] = await Promise.all([
    databaseHealthCheck(),
    eventLoopLag(),
  ]);

  const healthy = db.connected;
  const status  = healthy ? "healthy" : "degraded";

  res.status(healthy ? 200 : 503).json({
    status,
    service: config.appName,
    version: config.appVersion,
    env:     config.nodeEnv,
    commit:  config.gitCommit,
    uptime:  uptimeSeconds(),
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status:     db.connected ? "ok" : "error",
        readyState: db.readyState,
        host:       db.host,
      },
      memory: memoryMB(),
      eventLoopLagMs: lag,
    },
  });
});

// ── GET /api/ready ────────────────────────────────────────────────────────────
router.get("/ready", async (_req: Request, res: Response) => {
  const db = await databaseHealthCheck();

  // Ready = DB is connected (or no DB configured — in-memory mode)
  const ready = db.connected || !config.mongoUri;

  res.status(ready ? 200 : 503).json({
    ready,
    database: db.connected ? "connected" : config.mongoUri ? "disconnected" : "not-configured",
  });
});

// ── GET /api/live ─────────────────────────────────────────────────────────────
router.get("/live", (_req: Request, res: Response) => {
  // Liveness = process is running. Always 200 unless event loop is completely stuck.
  res.json({
    alive: true,
    pid:   process.pid,
    uptime: uptimeSeconds(),
  });
});

// ── GET /api/metrics ──────────────────────────────────────────────────────────
router.get("/metrics", async (_req: Request, res: Response) => {
  const [db, lag] = await Promise.all([
    databaseHealthCheck(),
    eventLoopLag(),
  ]);

  res.json({
    service: {
      name:    config.appName,
      version: config.appVersion,
      env:     config.nodeEnv,
      commit:  config.gitCommit,
      pid:     process.pid,
      uptime:  uptimeSeconds(),
      nodeVersion: process.version,
    },
    database: {
      connected:  db.connected,
      readyState: db.readyState,
      host:       db.host,
      poolSize:   (mongoose.connection as any)?.pool?.totalConnectionCount ?? 0,
    },
    memory: memoryMB(),
    cpu:    cpuUsage(),
    system: {
      platform:   process.platform,
      arch:       process.arch,
      cpus:       os.cpus().length,
      loadAvg:    os.loadavg().map((n) => Math.round(n * 100) / 100),
      totalMemMB: Math.round(os.totalmem()  / 1024 / 1024),
      freeMemMB:  Math.round(os.freemem()   / 1024 / 1024),
    },
    eventLoop: {
      lagMs: lag,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
