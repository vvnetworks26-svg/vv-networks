import mongoose from "mongoose";
import { Subscription, ISubscription, SubscriptionStatus } from "../models/Subscription.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class SubscriptionRepository extends BaseRepository<ISubscription> {
  constructor() { super(Subscription); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<ISubscription>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByStatus(businessId: string, status: SubscriptionStatus): Promise<ISubscription[]> {
    return this.model.find({ businessId, status, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findActive(businessId: string): Promise<ISubscription[]> {
    return this.model.find({
      businessId,
      status: { $in: ["trialing", "active", "grace_period"] },
      deletedAt: null,
    }).sort({ currentPeriodEnd: 1 }).exec();
  }

  async findUpcomingRenewals(businessId: string, withinDays = 7): Promise<ISubscription[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return this.model.find({
      businessId,
      status: { $in: ["active", "trialing"] },
      currentPeriodEnd: { $lte: cutoff, $gte: new Date() },
      cancelAtPeriodEnd: false,
      deletedAt: null,
    }).sort({ currentPeriodEnd: 1 }).exec();
  }

  async findByClient(clientId: string): Promise<ISubscription[]> {
    return this.model.find({ clientId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  /** Monthly Recurring Revenue — sum of active subscription amounts normalised to monthly */
  async getMRR(businessId: string): Promise<number> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const rows = await this.aggregate<{ interval: string; total: number }>([
      { $match: { businessId: bid, status: { $in: ["active", "trialing"] }, deletedAt: null } },
      { $group: { _id: "$interval", total: { $sum: "$amount" } } },
      { $project: { interval: "$_id", total: 1, _id: 0 } },
    ]);
    let mrr = 0;
    for (const r of rows) {
      if (r.interval === "monthly")   mrr += r.total;
      if (r.interval === "quarterly") mrr += r.total / 3;
      if (r.interval === "annual")    mrr += r.total / 12;
    }
    return Math.round(mrr * 100) / 100;
  }

  async getCount(businessId: string): Promise<{ active: number; cancelled: number; trialing: number; total: number }> {
    const bid = new mongoose.Types.ObjectId(businessId);
    const rows = await this.aggregate<{ status: string; count: number }>([
      { $match: { businessId: bid, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);
    const map = Object.fromEntries(rows.map((r) => [r.status, r.count]));
    return {
      active:    (map["active"] ?? 0) + (map["grace_period"] ?? 0),
      trialing:  map["trialing"]  ?? 0,
      cancelled: map["cancelled"] ?? 0,
      total:     rows.reduce((s, r) => s + r.count, 0),
    };
  }
}

export const subscriptionRepository = new SubscriptionRepository();
