import type { Request, Response } from "express";
import { ok, serverError } from "../response.js";
import { getBid } from "../middleware.js";
import { getAnalyticsSummary, getRecentEvents } from "../../services/analytics.service.js";
import { analyticsRepository } from "../../../database/repositories/AnalyticsRepository.js";

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const summary = await getAnalyticsSummary(getBid(req));
    ok(res, summary);
  } catch { serverError(res); }
}

export async function getTimeline(req: Request, res: Response): Promise<void> {
  try {
    const days = Math.min(+(req.query.days ?? 30), 90);
    const timeline = await analyticsRepository.getDailyTimeline(getBid(req), days);
    ok(res, timeline);
  } catch { serverError(res); }
}

export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(+(req.query.limit ?? 50), 200);
    const events = await getRecentEvents(getBid(req), limit);
    ok(res, events);
  } catch { serverError(res); }
}
