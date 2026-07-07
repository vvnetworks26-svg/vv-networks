import { projectRepository } from "../../database/repositories/ProjectRepository.js";
import type { IProject } from "../../database/models/Project.js";

export async function createProject(businessId: string, data: Partial<IProject>): Promise<IProject> {
  return projectRepository.create({ ...data, businessId } as unknown as Partial<IProject>);
}
export async function updateProject(id: string, data: Partial<IProject>): Promise<IProject | null> {
  return projectRepository.update(id, data);
}
export async function softDeleteProject(id: string): Promise<IProject | null> {
  return projectRepository.softDelete(id);
}
export async function restoreProject(id: string): Promise<IProject | null> {
  return projectRepository.restore(id);
}
export async function getProjectStats(businessId: string) {
  const [byStatus, revenue] = await Promise.all([
    projectRepository.aggregate<{ status: string; count: number }>([
      { $match: { businessId, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]),
    projectRepository.getRevenueStats(businessId),
  ]);
  return { byStatus, revenue: revenue[0] ?? { total: 0, paid: 0, outstanding: 0 } };
}
