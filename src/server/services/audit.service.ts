import { auditLogRepository } from "../../database/repositories/AuditLogRepository.js";
import type { AuditAction } from "../../database/models/AuditLog.js";
import type { Request } from "express";

export async function audit(
  action: AuditAction,
  opts: {
    req?: Request;
    userId?: string;
    businessId?: string;
    resource?: string;
    resourceId?: string;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await auditLogRepository.log({
      action,
      userId:     opts.userId,
      businessId: opts.businessId,
      resource:   opts.resource,
      resourceId: opts.resourceId,
      ipAddress:  opts.req ? (opts.req.headers["x-forwarded-for"] as string ?? opts.req.socket.remoteAddress) : undefined,
      userAgent:  opts.req?.headers["user-agent"],
      meta:       opts.meta,
    });
  } catch {
    // Audit failure must never break the primary request
  }
}
