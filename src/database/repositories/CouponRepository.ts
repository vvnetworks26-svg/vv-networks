import { Coupon, ICoupon } from "../models/Coupon.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class CouponRepository extends BaseRepository<ICoupon> {
  constructor() { super(Coupon); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<ICoupon>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByCode(businessId: string, code: string): Promise<ICoupon | null> {
    return this.model.findOne({ businessId, code: code.toUpperCase(), deletedAt: null }).exec();
  }

  async findActive(businessId: string): Promise<ICoupon[]> {
    return this.model.find({
      businessId,
      isActive: true,
      deletedAt: null,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).exec();
  }

  async incrementUsage(id: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { $inc: { usedCount: 1 } }).exec();
  }
}

export const couponRepository = new CouponRepository();
