import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import { leadRepository } from "../../../database/repositories/LeadRepository.js";
import {
  searchLeads, getLeadStats, createLead,
  updateLead, softDeleteLead, restoreLead,
} from "../../services/lead.service.js";

export async function listLeads(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, sort = "createdAt", order = "desc", ...filters } = req.query as any;
    const result = await searchLeads({ businessId: getBid(req), page: +page, limit: +limit, sort, order, ...filters });
    paginated(res, result.data, { page: result.page, limit, total: result.total, totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev });
  } catch { serverError(res); }
}

export async function searchLeadsHandler(req: Request, res: Response): Promise<void> {
  try {
    const params = { businessId: getBid(req), page: 1, limit: 20, sort: "createdAt", order: "desc" as const, ...((req as any).parsedQuery ?? {}) };
    const result = await searchLeads(params);
    paginated(res, result.data, { page: result.page, limit: params.limit, total: result.total, totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev });
  } catch { serverError(res); }
}

export async function getLeadStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getLeadStats(getBid(req));
    ok(res, stats);
  } catch { serverError(res); }
}

export async function getLead(req: Request, res: Response): Promise<void> {
  try {
    const lead = await leadRepository.findById(req.params.id);
    if (!lead) { notFound(res, "Lead"); return; }
    ok(res, lead);
  } catch { serverError(res); }
}

export async function createLeadHandler(req: Request, res: Response): Promise<void> {
  try {
    const lead = await createLead(getBid(req), req.body);
    created(res, lead);
  } catch { serverError(res); }
}

export async function updateLeadHandler(req: Request, res: Response): Promise<void> {
  try {
    const lead = await updateLead(req.params.id, req.body);
    if (!lead) { notFound(res, "Lead"); return; }
    ok(res, lead);
  } catch { serverError(res); }
}

export async function deleteLeadHandler(req: Request, res: Response): Promise<void> {
  try {
    const lead = await softDeleteLead(req.params.id);
    if (!lead) { notFound(res, "Lead"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}

export async function restoreLeadHandler(req: Request, res: Response): Promise<void> {
  try {
    const lead = await restoreLead(req.params.id);
    if (!lead) { notFound(res, "Lead"); return; }
    ok(res, lead);
  } catch { serverError(res); }
}
