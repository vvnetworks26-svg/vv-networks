import { TaxRate, ITaxRate } from "../models/TaxRate.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class TaxRateRepository extends BaseRepository<ITaxRate> {
  constructor() { super(TaxRate); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<ITaxRate>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findActive(businessId: string): Promise<ITaxRate[]> {
    return this.model.find({ businessId, isActive: true, deletedAt: null }).exec();
  }

  async findDefault(businessId: string): Promise<ITaxRate | null> {
    return this.model.findOne({ businessId, isDefault: true, isActive: true, deletedAt: null }).exec();
  }

  async findByCountry(businessId: string, country: string, state?: string): Promise<ITaxRate[]> {
    const filter: Record<string, unknown> = { businessId, country, isActive: true, deletedAt: null };
    if (state) filter["state"] = state;
    return this.model.find(filter).exec();
  }

  /** Ensure only one default per business when setting a new default */
  async setDefault(businessId: string, id: string): Promise<void> {
    await this.model.updateMany({ businessId, isDefault: true }, { isDefault: false }).exec();
    await this.model.updateOne({ _id: id }, { isDefault: true }).exec();
  }
}

export const taxRateRepository = new TaxRateRepository();
