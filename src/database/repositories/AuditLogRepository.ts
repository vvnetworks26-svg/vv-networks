import mongoose from "mongoose";
import { AuditLog, IAuditLog, AuditAction } from "../models/AuditLog.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() { super(AuditLog); }

  async log(entry: {
    userId?: string;
    businessId?: string;
    action: AuditAction;
    resource?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    meta?: Record<string, unknown>;
  }): Promise<IAuditLog> {
    return this.create(entry as unknown as Partial<IAuditLog>);
  }

  async findByUser(userId: string, limit = 50): Promise<IAuditLog[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findByBusiness(
    businessId: string,
    opts: PaginateOptions & { action?: string; since?: Date; until?: Date }
  ): Promise<PaginateResult<IAuditLog>> {
    const filter: Record<string, unknown> = { businessId };
    if (opts.action) filter["action"] = opts.action;
    if (opts.since || opts.until) {
      const range: Record<string, Date> = {};
      if (opts.since) range["$gte"] = opts.since;
      if (opts.until) range["$lte"] = opts.until;
      filter["createdAt"] = range;
    }
    return this.paginate(filter, { page: opts.page, limit: opts.limit });
  }

  async findFiltered(opts: {
    userId?:     string;
    businessId?: string;
    action?:     string;
    resource?:   string;
    since?:      Date;
    until?:      Date;
    page:        number;
    limit:       number;
  }): Promise<PaginateResult<IAuditLog>> {
    const filter: Record<string, unknown> = {};
    if (opts.userId)     filter["userId"]     = new mongoose.Types.ObjectId(opts.userId);
    if (opts.businessId) filter["businessId"] = new mongoose.Types.ObjectId(opts.businessId);
    if (opts.action)     filter["action"]     = opts.action;
    if (opts.resource)   filter["resource"]   = opts.resource;
    if (opts.since || opts.until) {
      const range: Record<string, Date> = {};
      if (opts.since) range["$gte"] = opts.since;
      if (opts.until) range["$lte"] = opts.until;
      filter["createdAt"] = range;
    }
    return this.paginate(filter, { page: opts.page, limit: opts.limit });
  }

  async getActionStats(businessId: string, since?: Date): Promise<{ action: string; count: number }[]> {
    const match: Record<string, unknown> = { businessId: new mongoose.Types.ObjectId(businessId) };
    if (since) match["createdAt"] = { $gte: since };
    return this.aggregate([
      { $match: match },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $project: { action: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getActivityTimeline(businessId: string, days = 7): Promise<
    Array<{ date: string; count: number }>
  > {
    const since = new Date(Date.now() - days * 86_400_000);
    return this.aggregate([
      { $match: { businessId: new mongoose.Types.ObjectId(businessId), createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $project: { date: "$_id", count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);
  }
}

export const auditLogRepository = new AuditLogRepository();
