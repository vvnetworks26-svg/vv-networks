import { AnalyticsEvent, IAnalyticsEvent, AnalyticsEventName } from "../models/AnalyticsEvent.js";
import { BaseRepository } from "./BaseRepository.js";

export class AnalyticsRepository extends BaseRepository<IAnalyticsEvent> {
  constructor() { super(AnalyticsEvent); }

  async track(
    businessId: string,
    name: AnalyticsEventName,
    properties?: Record<string, string | number | boolean>,
    meta?: { sessionId?: string; leadId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<IAnalyticsEvent> {
    return this.create({ businessId, name, properties, ...meta } as unknown as Partial<IAnalyticsEvent>);
  }

  async getEventCounts(businessId: string, since: Date): Promise<{ name: string; count: number }[]> {
    return this.aggregate([
      { $match: { businessId, createdAt: { $gte: since } } },
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $project: { name: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getDailyTimeline(businessId: string, days = 30): Promise<{ date: string; count: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.aggregate([
      { $match: { businessId, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);
  }
}

export const analyticsRepository = new AnalyticsRepository();
