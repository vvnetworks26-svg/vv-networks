import { Project, IProject, ProjectStatus } from "../models/Project.js";
import { BaseRepository, PaginateOptions, PaginateResult } from "./BaseRepository.js";

export class ProjectRepository extends BaseRepository<IProject> {
  constructor() { super(Project); }

  async findByBusiness(businessId: string, opts: PaginateOptions): Promise<PaginateResult<IProject>> {
    return this.paginate({ businessId, deletedAt: null }, opts);
  }

  async findByStatus(businessId: string, status: ProjectStatus): Promise<IProject[]> {
    return this.model.find({ businessId, status, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  async getRevenueStats(businessId: string): Promise<{ total: number; paid: number; outstanding: number }[]> {
    return this.aggregate([
      { $match: { businessId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: "$totalValue" }, paid: { $sum: "$paidValue" } } },
      { $project: { _id: 0, total: 1, paid: 1, outstanding: { $subtract: ["$total", "$paid"] } } },
    ]);
  }
}

export const projectRepository = new ProjectRepository();
