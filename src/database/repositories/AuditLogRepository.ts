import { AuditLog, IAuditLog, AuditAction } from "../models/AuditLog.js";
import { BaseRepository } from "./BaseRepository.js";

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
}

export const auditLogRepository = new AuditLogRepository();
