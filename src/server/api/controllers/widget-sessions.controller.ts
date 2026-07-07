import type { Request, Response } from "express";
import { ok, created, notFound, serverError } from "../response.js";
import { getBid } from "../middleware.js";
import { widgetSessionRepository } from "../../../database/repositories/WidgetSessionRepository.js";

export async function listWidgetSessions(req: Request, res: Response): Promise<void> {
  try {
    const stats = await widgetSessionRepository.getSessionStats(getBid(req));
    const recent = await widgetSessionRepository.findMany({ businessId: getBid(req), expiresAt: { $gt: new Date() } }, { sort: { createdAt: -1 }, limit: 20 } as any);
    ok(res, { stats, recent });
  } catch { serverError(res); }
}

export async function createWidgetSession(req: Request, res: Response): Promise<void> {
  try {
    const session = await widgetSessionRepository.createSession(getBid(req), req.body);
    created(res, session);
  } catch { serverError(res); }
}

export async function updateWidgetSession(req: Request, res: Response): Promise<void> {
  try {
    const { phase, qualificationScore, qualificationData, appointmentRequested, leadId } = req.body;
    let session = await widgetSessionRepository.findById(req.params.id);
    if (!session) { notFound(res, "Widget session"); return; }
    if (phase !== undefined) {
      session = await widgetSessionRepository.updatePhase(req.params.id, phase, qualificationScore ?? session.qualificationScore, qualificationData ?? session.qualificationData);
    }
    if (appointmentRequested !== undefined || leadId !== undefined) {
      const update: any = {};
      if (appointmentRequested !== undefined) update.appointmentRequested = appointmentRequested;
      if (leadId !== undefined) update.leadId = leadId;
      session = await widgetSessionRepository.update(req.params.id, update);
    }
    ok(res, session);
  } catch { serverError(res); }
}
