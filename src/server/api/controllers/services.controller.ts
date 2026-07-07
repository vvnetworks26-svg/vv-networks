import type { Request, Response } from "express";
import { ok, created, notFound, serverError } from "../response.js";
import { getBid } from "../middleware.js";
import { serviceRepository } from "../../../database/repositories/ServiceRepository.js";

export async function listServices(req: Request, res: Response): Promise<void> {
  try {
    const services = await serviceRepository.findActive(getBid(req));
    ok(res, services);
  } catch { serverError(res); }
}

export async function getService(req: Request, res: Response): Promise<void> {
  try {
    const service = await serviceRepository.findById(req.params.id);
    if (!service) { notFound(res, "Service"); return; }
    ok(res, service);
  } catch { serverError(res); }
}

export async function createServiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const service = await serviceRepository.create({ ...req.body, businessId: getBid(req) });
    created(res, service);
  } catch { serverError(res); }
}

export async function updateServiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const service = await serviceRepository.update(req.params.id, req.body);
    if (!service) { notFound(res, "Service"); return; }
    ok(res, service);
  } catch { serverError(res); }
}

export async function deleteServiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const service = await serviceRepository.softDelete(req.params.id);
    if (!service) { notFound(res, "Service"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}
