import { analyticsRepository } from "../../database/repositories/AnalyticsRepository.js";
import type { AnalyticsEventName } from "../../database/models/AnalyticsEvent.js";
import mongoose from "mongoose";

function toOid(id: string): mongoose.Types.ObjectId | string {
  try { return new mongoose.Types.ObjectId(id); } catch { return id; }
}

export async function trackEvent(
  businessId: string,
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean>,
  meta?: { sessionId?: string; leadId?: string; ipAddress?: string; userAgent?: string }
) {
  return analyticsRepository.track(businessId, name, properties, meta);
}

export async function getAnalyticsSummary(businessId: string) {
  const bid = toOid(businessId);
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [counts, timeline] = await Promise.all([
    analyticsRepository.getEventCounts(businessId, since),
    analyticsRepository.getDailyTimeline(businessId, 30),
  ]);
  const total = await analyticsRepository.count({ businessId: bid, createdAt: { $gte: since } } as any);
  return { since, totalEvents: total, eventCounts: counts, dailyTimeline: timeline };
}

export async function getRecentEvents(businessId: string, limit = 50) {
  return analyticsRepository.findMany({ businessId } as any, { sort: { createdAt: -1 }, limit } as any);
}
