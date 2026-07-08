import { BillingProfile, IBillingProfile } from "../models/BillingProfile.js";
import { BaseRepository } from "./BaseRepository.js";

export class BillingProfileRepository extends BaseRepository<IBillingProfile> {
  constructor() { super(BillingProfile); }

  async findByBusiness(businessId: string): Promise<IBillingProfile | null> {
    return this.model.findOne({ businessId }).exec();
  }

  async upsertByBusiness(businessId: string, data: Partial<IBillingProfile>): Promise<IBillingProfile> {
    return this.model.findOneAndUpdate(
      { businessId },
      { $set: { ...data, businessId } },
      { new: true, upsert: true, runValidators: true }
    ).exec() as Promise<IBillingProfile>;
  }
}

export const billingProfileRepository = new BillingProfileRepository();
