/**
 * HTTP Request Logger Middleware — Phase I.6/I.7
 *
 * Attaches a correlation ID to every request, logs entry/exit,
 * feeds MetricsService and PerformanceService, and masks sensitive fields.
 */

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import logger from "../logger.js";
import metricsService, { METRIC } from "../services/metrics.service.js";
import performanceService from "../services/performance.service.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId: string;
      startTime:     number;
    }
  }
}

const SKIP_PATHS = new Set(["/api/health", "/api/ready", "/api/live", "/favicon.ico"]);
const SENSITIVE_PARAMS = ["token", "secret", "password", "api_key", "apikey"];

function maskUrl(url: string): string {
  try {
    const u = new URL(url, "http://x");
    for (const key of SENSITIVE_PARAMS) {
      if (u.searchParams.has(key)) u.searchParams.set(key, "[REDACTED]");
    }
    return u.pathname + (u.search || "");
  } catch {
    return url;
  }
}

/** Normalise a request path into a route pattern for aggregation */
function routePattern(req: Request): string {
  // Use express matched route if available, else raw path with IDs replaced
  const matched = (req as any).route?.path as string | undefined;
  if (matched) return matched;
  return req.path.replace(/\/[0-9a-f]{24}/gi, "/:id").replace(/\/\d+/g, "/:id");
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Attach correlation ID
  req.correlationId = (req.headers["x-correlation-id"] as string) ?? randomUUID();
  req.startTime     = Date.now();

  // Propagate correlation ID downstream
  res.setHeader("X-Correlation-Id", req.correlationId);

  if (SKIP_PATHS.has(req.path)) { next(); return; }

  metricsService.increment(METRIC.HTTP_REQUESTS_TOTAL);

  const reqLogger = logger.child({ correlationId: req.correlationId });

  reqLogger.info("→ request", {
    method: req.method,
    url:    maskUrl(req.originalUrl),
    ip:     req.ip ?? req.socket?.remoteAddress,
    ua:     req.headers["user-agent"]?.slice(0, 100),
  });

  // Log response on finish
  res.on("finish", () => {
    const duration = Date.now() - req.startTime;
    const level    = res.statusCode >= 500 ? "error"
                   : res.statusCode >= 400 ? "warn"
                   : "info";

    reqLogger[level]("← response", {
      method:   req.method,
      url:      maskUrl(req.originalUrl),
      status:   res.statusCode,
      duration,
    });

    // Feed metrics
    if (res.statusCode >= 500) {
      metricsService.increment(METRIC.HTTP_5XX_TOTAL);
      metricsService.increment(METRIC.HTTP_REQUESTS_ERRORS);
    } else if (res.statusCode >= 400) {
      metricsService.increment(METRIC.HTTP_4XX_TOTAL);
    }

    // Feed performance service
    performanceService.record(req.method, routePattern(req), duration, res.statusCode);
  });

  next();
}
