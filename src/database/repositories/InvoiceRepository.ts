import { Invoice, IInvoice } from "../models/Invoice.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class InvoiceRepository extends BaseRepository<IInvoice> {
  constructor() { super(Invoice); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IInvoice>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByProject(projectId: string): Promise<IInvoice[]> {
    return this.model.find({ projectId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async findOverdue(businessId: string): Promise<IInvoice[]> {
    return this.model.find({
      businessId,
      status: "sent",
      dueAt: { $lt: new Date() },
      deletedAt: null,
    }).sort({ dueAt: 1 }).exec();
  }

  async getNextInvoiceNumber(businessId: string): Promise<string> {
    const count = await this.count({ businessId });
    return `INV-${String(count + 1).padStart(4, "0")}`;
  }
}

export const invoiceRepository = new InvoiceRepository();
