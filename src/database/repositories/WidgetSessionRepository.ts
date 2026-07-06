import { WidgetSession, IWidgetSession } from "../models/WidgetSession.js";
import { BaseRepository } from "./BaseRepository.js";
import crypto from "crypto";

export class WidgetSessionRepository extends BaseRepository<IWidgetSession> {
  constructor() { super(WidgetSession); }

  async findByToken(token: string): Promise<IWidgetSession | null> {
    return this.model.findOne({ sessionToken: token, expiresAt: { $gt: new Date() } }).exec();
  }

  async createSession(businessId: string, meta: { ipAddress?: string; userAgent?: string; referrer?: string }): Promise<IWidgetSession> {
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return this.create({ businessId, sessionToken, expiresAt, ...meta } as unknown as Partial<IWidgetSession>);
  }

  async updatePhase(id: string, phase: IWidgetSession["phase"], qualificationScore: number, qualificationData: Record<string, string>): Promise<IWidgetSession | null> {
    return this.update(id, { phase, qualificationScore, qualificationData, $inc: { messageCount: 1 } } as any);
  }

  async getSessionStats(businessId: string): Promise<{ phase: string; count: number }[]> {
    return this.aggregate([
      { $match: { businessId, expiresAt: { $gt: new Date() } } },
      { $group: { _id: "$phase", count: { $sum: 1 } } },
      { $project: { phase: "$_id", count: 1, _id: 0 } },
    ]);
  }
}

export const widgetSessionRepository = new WidgetSessionRepository();
