import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import { projectRepository } from "../../../database/repositories/ProjectRepository.js";
import { createProject, updateProject, softDeleteProject, restoreProject, getProjectStats } from "../../services/project.service.js";

export async function listProjects(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20, status } = req.query as any;
    const filter: any = { businessId: getBid(req), deletedAt: null };
    if (status) filter.status = status;
    const result = await projectRepository.paginate(filter, { page: +page, limit: +limit });
    paginated(res, result.data, { page: result.page, limit: +limit, total: result.total, totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev });
  } catch { serverError(res); }
}

export async function getProject(req: Request, res: Response): Promise<void> {
  try {
    const project = await projectRepository.findById(req.params.id);
    if (!project) { notFound(res, "Project"); return; }
    ok(res, project);
  } catch { serverError(res); }
}

export async function createProjectHandler(req: Request, res: Response): Promise<void> {
  try {
    const project = await createProject(getBid(req), req.body);
    created(res, project);
  } catch { serverError(res); }
}

export async function updateProjectHandler(req: Request, res: Response): Promise<void> {
  try {
    const project = await updateProject(req.params.id, req.body);
    if (!project) { notFound(res, "Project"); return; }
    ok(res, project);
  } catch { serverError(res); }
}

export async function deleteProjectHandler(req: Request, res: Response): Promise<void> {
  try {
    const project = await softDeleteProject(req.params.id);
    if (!project) { notFound(res, "Project"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}

export async function restoreProjectHandler(req: Request, res: Response): Promise<void> {
  try {
    const project = await restoreProject(req.params.id);
    if (!project) { notFound(res, "Project"); return; }
    ok(res, project);
  } catch { serverError(res); }
}

export async function getProjectStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getProjectStats(getBid(req));
    ok(res, stats);
  } catch { serverError(res); }
}
