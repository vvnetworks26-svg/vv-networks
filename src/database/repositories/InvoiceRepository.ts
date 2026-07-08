import mongoose from "mongoose";
import { Invoice, IInvoice, InvoiceStatus } from "../models/Invoice.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class InvoiceRepository extends BaseRepository<IInvoice> {
  constructor() { super(Invoice); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IInvoice>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByStatus(businessId: string, status: InvoiceStatus): Promise<IInvoice[]> {
    return this.model.find({ businessId, status, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findByProject(projectId: string): Promise<IInvoice[]> {
    return this.model.find({ projectId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findByClient(clientId: string): Promise<IInvoice[]> {
    return this.model.find({ clientId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findOverdue(businessId: string): Promise<IInvoice[]> {
    return this.model.find({
      businessId,
      status: "sent",
      dueAt: { $lt: new Date() },
      deletedAt: null,
    }).sort({ dueAt: 1 }).exec();
  }

  async findRecentPaid(businessId: string, limit = 5): Promise<IInvoice[]> {
    return this.model.find({ businessId, status: "paid", deletedAt: null })
      .sort({ paidAt: -1 }).limit(limit).exec();
  }

  async getNextInvoiceNumber(businessId: string): Promise<string> {
    const count = await this.count({ businessId });
    return `INV-${String(count + 1).padStart(4, "0")}`;
  }

  async getOutstandingBalance(businessId: string): Promise<number> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const result = await this.aggregate<{ total: number }>([
      { $match: { businessId: bid, status: { $in: ["sent", "overdue"] }, deletedAt: null } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async getRevenueStats(businessId: string): Promise<{
    totalBilled: number; totalPaid: number; totalOutstanding: number; averageValue: number; count: number;
  }> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const result = await this.aggregate<{
      totalBilled: number; totalPaid: number; totalOutstanding: number; count: number;
    }>([
      { $match: { businessId: bid, status: { $ne: "cancelled" }, deletedAt: null } },
      {
        $group: {
          _id: null,
          totalBilled:      { $sum: "$total" },
          totalPaid:        { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$total", 0] } },
          totalOutstanding: { $sum: { $cond: [{ $in: ["$status", ["sent", "overdue"]] }, "$total", 0] } },
          count:            { $sum: 1 },
        },
      },
    ]);
    const r = result[0];
    if (!r) return { totalBilled: 0, totalPaid: 0, totalOutstanding: 0, averageValue: 0, count: 0 };
    return {
      totalBilled:      r.totalBilled,
      totalPaid:        r.totalPaid,
      totalOutstanding: r.totalOutstanding,
      averageValue:     r.count ? Math.round((r.totalBilled / r.count) * 100) / 100 : 0,
      count:            r.count,
    };
  }

  async getRevenueByService(businessId: string): Promise<{ service: string; revenue: number }[]> {
    const bid = new mongoose.Types.ObjectId(businessId);
    return this.aggregate([
      { $match: { businessId: bid, status: "paid", deletedAt: null } },
      { $unwind: "$lineItems" },
      { $group: { _id: "$lineItems.description", revenue: { $sum: "$lineItems.total" } } },
      { $project: { service: "$_id", revenue: 1, _id: 0 } },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
    ]);
  }

  async getRevenueByMonth(businessId: string, months = 12): Promise<{ year: number; month: number; revenue: number }[]> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    return this.aggregate([
      { $match: { businessId: bid, status: "paid", paidAt: { $gte: since }, deletedAt: null } },
      {
        $group: {
          _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
          revenue: { $sum: "$total" },
          count:   { $sum: 1 },
        },
      },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", revenue: 1, count: 1 } },
      { $sort: { year: 1, month: 1 } },
    ]);
  }
}

export const invoiceRepository = new InvoiceRepository();
