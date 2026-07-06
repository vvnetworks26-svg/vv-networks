import { User, IUser } from "../models/User.js";
import { BaseRepository } from "./BaseRepository.js";

export class UserRepository extends BaseRepository<IUser> {
  constructor() { super(User); }

  async findByEmail(businessId: string, email: string): Promise<IUser | null> {
    return this.model.findOne({ businessId, email: email.toLowerCase(), deletedAt: null }).exec();
  }

  async findByBusiness(businessId: string): Promise<IUser[]> {
    return this.model.find({ businessId, deletedAt: null, isActive: true }).exec();
  }
}

export const userRepository = new UserRepository();
