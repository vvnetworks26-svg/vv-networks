import { Business, IBusiness } from "../models/Business.js";
import { BaseRepository } from "./BaseRepository.js";

export class BusinessRepository extends BaseRepository<IBusiness> {
  constructor() { super(Business); }

  async findBySlug(slug: string): Promise<IBusiness | null> {
    return this.model.findOne({ slug, deletedAt: null }).exec();
  }

  async findByEmail(email: string): Promise<IBusiness | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: null }).exec();
  }

  async findActive(): Promise<IBusiness[]> {
    return this.model.find({ status: "active", deletedAt: null }).exec();
  }
}

export const businessRepository = new BusinessRepository();
