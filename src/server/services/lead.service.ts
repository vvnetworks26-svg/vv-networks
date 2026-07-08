import { leadRepository } from "../../database/repositories/LeadRepository.js";
import type { ILead } from "../../database/models/Lead.js";
import type { FilterQuery } from "mongoose";
import mongoose from "mongoose";
import metricsService, { METRIC } from "./metrics.service.js";

function toOid(id: string): mongoose.Types.ObjectId | string {
  try { return new mongoose.Types.ObjectId(id); } catch { return id; }
}

export interface LeadSearchParams {
  businessId: string;
  q?: string;
  status?: string;
  source?: string;
  industry?: string;
  minScore?: number;
  maxScore?: number;
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
}

export async function searchLeads(params: LeadSearchParams) {
  const filter: FilterQuery<ILead> = { businessId: params.businessId, deletedAt: null };
  if (params.status)   filter.status   = params.status;
  if (params.source)   filter.source   = params.source;
  if (params.industry) filter.industry = params.industry;
  if (params.minScore !== undefined || params.maxScore !== undefined) {
    filter.qualificationScore = {};
    if (params.minScore !== undefined) (filter.qualificationScore as any).$gte = params.minScore;
    if (params.maxScore !== undefined) (filter.qualificationScore as any).$lte = params.maxScore;
  }
  if (params.q) {
    const re = new RegExp(params.q, "i");
    filter.$or = [{ name: re }, { email: re }, { company: re }, { phone: re }] as any;
  }
  return leadRepository.paginate(filter, {
    page: params.page,
    limit: params.limit,
    sort: { [params.sort]: params.order === "asc" ? 1 : -1 },
  });
}

export async function getLeadStats(businessId: string) {
  const bid = toOid(businessId);

  const [statusStats, total, scoreAgg, sourceAgg, industryAgg] = await Promise.all([
    leadRepository.getLeadStats(businessId),
    leadRepository.count({ businessId: bid, deletedAt: null } as any),
    leadRepository.aggregate<{ avg: number }>([
      { $match: { businessId: bid, deletedAt: null } },
      { $group: { _id: null, avg: { $avg: "$qualificationScore" } } },
    ]),
    leadRepository.aggregate<{ source: string; count: number }>([
      { $match: { businessId: bid, deletedAt: null } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $project: { source: "$_id", count: 1, _id: 0 } },
    ]),
    leadRepository.aggregate<{ industry: string; count: number }>([
      { $match: { businessId: bid, deletedAt: null, industry: { $ne: null } } },
      { $group: { _id: "$industry", count: { $sum: 1 } } },
      { $project: { industry: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    total,
    byStatus: statusStats,
    averageScore: Math.round(scoreAgg[0]?.avg ?? 0),
    bySource: sourceAgg,
    byIndustry: industryAgg,
  };
}

export async function createLead(businessId: string, data: Partial<ILead>): Promise<ILead> {
  const lead = await leadRepository.create({ ...data, businessId } as unknown as Partial<ILead>);
  metricsService.increment(METRIC.LEADS_CREATED);
  return lead;
}

export async function updateLead(id: string, data: Partial<ILead>): Promise<ILead | null> {
  return leadRepository.update(id, data);
}

export async function softDeleteLead(id: string): Promise<ILead | null> {
  return leadRepository.softDelete(id);
}

export async function restoreLead(id: string): Promise<ILead | null> {
  return leadRepository.restore(id);
}
