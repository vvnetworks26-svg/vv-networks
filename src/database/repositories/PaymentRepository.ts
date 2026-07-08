import mongoose from "mongoose";
import { Payment, IPayment, PaymentStatus } from "../models/Payment.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() { super(Payment); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IPayment>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByInvoice(invoiceId: string): Promise<IPayment[]> {
    return this.model.find({ invoiceId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findBySubscription(subscriptionId: string): Promise<IPayment[]> {
    return this.model.find({ subscriptionId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findByStatus(businessId: string, status: PaymentStatus): Promise<IPayment[]> {
    return this.model.find({ businessId, status, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async getTotalCollected(businessId: string): Promise<number> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const result = await this.aggregate<{ total: number }>([
      { $match: { businessId: bid, status: "succeeded", deletedAt: null } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async getRevenueByMonth(businessId: string, months = 12): Promise<{ year: number; month: number; revenue: number }[]> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    return this.aggregate([
      { $match: { businessId: bid, status: "succeeded", paidAt: { $gte: since }, deletedAt: null } },
      {
        $group: {
          _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", revenue: 1 } },
      { $sort: { year: 1, month: 1 } },
    ]);
  }

  async getStats(businessId: string): Promise<{
    total: number; succeeded: number; pending: number; failed: number; refunded: number;
  }> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const rows = await this.aggregate<{ status: string; count: number }>([
      { $match: { businessId: bid, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);
    const map = Object.fromEntries(rows.map((r) => [r.status, r.count]));
    return {
      total:     rows.reduce((s, r) => s + r.count, 0),
      succeeded: map["succeeded"] ?? 0,
      pending:   map["pending"]   ?? 0,
      failed:    map["failed"]    ?? 0,
      refunded:  (map["refunded"] ?? 0) + (map["partial_refund"] ?? 0),
    };
  }
}

export const paymentRepository = new PaymentRepository();
