import { PaymentMethod, IPaymentMethod } from "../models/PaymentMethod.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class PaymentMethodRepository extends BaseRepository<IPaymentMethod> {
  constructor() { super(PaymentMethod); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IPaymentMethod>> {
    return this.paginate({ businessId, isActive: true, deletedAt: null }, opts);
  }

  async findByClient(clientId: string): Promise<IPaymentMethod[]> {
    return this.model.find({ clientId, isActive: true, deletedAt: null }).exec();
  }

  async findDefault(businessId: string): Promise<IPaymentMethod | null> {
    return this.model.findOne({ businessId, isDefault: true, isActive: true, deletedAt: null }).exec();
  }

  async setDefault(businessId: string, id: string): Promise<void> {
    await this.model.updateMany({ businessId, isDefault: true }, { isDefault: false }).exec();
    await this.model.updateOne({ _id: id }, { isDefault: true }).exec();
  }
}

export const paymentMethodRepository = new PaymentMethodRepository();
