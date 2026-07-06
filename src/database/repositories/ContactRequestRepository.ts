import { ContactRequest, IContactRequest } from "../models/ContactRequest.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class ContactRequestRepository extends BaseRepository<IContactRequest> {
  constructor() { super(ContactRequest); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IContactRequest>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findNew(businessId: string): Promise<IContactRequest[]> {
    return this.model.find({ businessId, status: "new", deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async markReviewed(id: string, reviewedBy: string): Promise<IContactRequest | null> {
    return this.update(id, { status: "reviewed", reviewedBy, reviewedAt: new Date() });
  }
}

export const contactRequestRepository = new ContactRequestRepository();
