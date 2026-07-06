import { Lead, ILead, LeadStatus } from "../models/Lead.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class LeadRepository extends BaseRepository<ILead> {
  constructor() { super(Lead); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<ILead>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByStatus(businessId: string, status: LeadStatus): Promise<ILead[]> {
    return this.model.find({ businessId, status, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findByEmail(businessId: string, email: string): Promise<ILead | null> {
    return this.model.findOne({ businessId, email: email.toLowerCase(), deletedAt: null }).exec();
  }

  async getLeadStats(businessId: string): Promise<{ status: string; count: number }[]> {
    return this.aggregate([
      { $match: { businessId, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);
  }
}

export const leadRepository = new LeadRepository();
