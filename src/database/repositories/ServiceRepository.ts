import { Service, IService } from "../models/Service.js";
import { BaseRepository } from "./BaseRepository.js";

export class ServiceRepository extends BaseRepository<IService> {
  constructor() { super(Service); }

  async findActive(businessId: string): Promise<IService[]> {
    return this.model.find({ businessId, isActive: true, deletedAt: null }).exec();
  }

  async findByType(businessId: string, type: IService["type"]): Promise<IService[]> {
    return this.model.find({ businessId, type, isActive: true, deletedAt: null }).exec();
  }
}

export const serviceRepository = new ServiceRepository();
