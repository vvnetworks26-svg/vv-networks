/**
 * Maintenance Mode Middleware — Phase I.7
 *
 * Intercepts requests when maintenance mode is active.
 * Monitoring endpoints and the operations API are always allowed through.
 */

import type { Request, Response, NextFunction } from "express";
import { maintenanceService } from "../services/maintenance.service.js";

const ALWAYS_ALLOWED = new Set([
  "/api/health",
  "/api/ready",
  "/api/live",
  "/api/metrics",
  "/api/operations/status",
  "/api/operations/features",
]);

export function maintenanceGuard(req: Request, res: Response, next: NextFunction): void {
  // Always allow monitoring + operations endpoints
  if (ALWAYS_ALLOWED.has(req.path) || req.path.startsWith("/api/operations")) {
    next();
    return;
  }

  const userId     = (req as any).user?.sub as string | undefined;
  const businessId = (req as any).businessId    as string | undefined;
  const ip         = req.ip ?? req.socket?.remoteAddress;

  if (maintenanceService.isBlocked({ ip, userId, businessId })) {
    maintenanceService.incrementBlocked();
    const status = maintenanceService.getStatus();
    res.status(503).json({
      success: false,
      error:   "Service temporarily unavailable",
      code:    "MAINTENANCE_MODE",
      message: status.message,
      estimatedCompletion: status.estimatedCompletion,
    });
    return;
  }

  next();
}
