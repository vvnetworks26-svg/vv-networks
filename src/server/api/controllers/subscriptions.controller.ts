import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import {
  createSubscription, listSubscriptions, getSubscription,
  updateSubscription, cancelSubscription, pauseSubscription,
  resumeSubscription, getSubscriptionCount, getUpcomingRenewals,
} from "../../services/subscription.service.js";

export async function listSubscriptionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await listSubscriptions(getBid(req), +page, +limit);
    paginated(res, result.data, {
      page: result.page, limit: +limit,
      total: result.total, totalPages: result.totalPages,
      hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch { serverError(res); }
}

export async function getSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const sub = await getSubscription(req.params.id);
    if (!sub) { notFound(res, "Subscription"); return; }
    ok(res, sub);
  } catch { serverError(res); }
}

export async function createSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const sub = await createSubscription(getBid(req), req.body);
    created(res, sub);
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function updateSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const sub = await updateSubscription(req.params.id, req.body);
    if (!sub) { notFound(res, "Subscription"); return; }
    ok(res, sub);
  } catch { serverError(res); }
}

export async function cancelSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const { atPeriodEnd = true } = req.body as { atPeriodEnd?: boolean };
    const sub = await cancelSubscription(req.params.id, atPeriodEnd);
    if (!sub) { notFound(res, "Subscription"); return; }
    ok(res, sub);
  } catch { serverError(res); }
}

export async function pauseSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const sub = await pauseSubscription(req.params.id);
    if (!sub) { notFound(res, "Subscription"); return; }
    ok(res, sub);
  } catch { serverError(res); }
}

export async function resumeSubscriptionHandler(req: Request, res: Response): Promise<void> {
  try {
    const sub = await resumeSubscription(req.params.id);
    if (!sub) { notFound(res, "Subscription"); return; }
    ok(res, sub);
  } catch { serverError(res); }
}

export async function getSubscriptionStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const counts = await getSubscriptionCount(getBid(req));
    ok(res, counts);
  } catch { serverError(res); }
}

export async function getUpcomingRenewalsHandler(req: Request, res: Response): Promise<void> {
  try {
    const renewals = await getUpcomingRenewals(getBid(req));
    ok(res, renewals);
  } catch { serverError(res); }
}
