import { Quote, IQuote, QuoteStatus } from "../models/Quote.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class QuoteRepository extends BaseRepository<IQuote> {
  constructor() { super(Quote); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IQuote>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByStatus(businessId: string, status: QuoteStatus): Promise<IQuote[]> {
    return this.model.find({ businessId, status, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findByClient(clientId: string): Promise<IQuote[]> {
    return this.model.find({ clientId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findExpired(businessId: string): Promise<IQuote[]> {
    return this.model.find({
      businessId,
      status: { $in: ["draft", "sent"] },
      validUntil: { $lt: new Date() },
      deletedAt: null,
    }).exec();
  }

  async getNextQuoteNumber(businessId: string): Promise<string> {
    const count = await this.count({ businessId });
    return `QUO-${String(count + 1).padStart(4, "0")}`;
  }

  async getStats(businessId: string): Promise<{ status: string; count: number; total: number }[]> {
    return this.aggregate([
      { $match: { businessId, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$total" } } },
      { $project: { status: "$_id", count: 1, total: 1, _id: 0 } },
    ]);
  }
}

export const quoteRepository = new QuoteRepository();
