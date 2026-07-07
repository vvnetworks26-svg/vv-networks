import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import { contactRequestRepository } from "../../../database/repositories/ContactRequestRepository.js";
import { createContactRequest, updateContactRequest, softDeleteContactRequest } from "../../services/contact-request.service.js";

export async function listContactRequests(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await contactRequestRepository.findByBusiness(getBid(req), { page: +page, limit: +limit });
    paginated(res, result.data, { page: result.page, limit: +limit, total: result.total, totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev });
  } catch { serverError(res); }
}

export async function getContactRequest(req: Request, res: Response): Promise<void> {
  try {
    const cr = await contactRequestRepository.findById(req.params.id);
    if (!cr) { notFound(res, "Contact request"); return; }
    ok(res, cr);
  } catch { serverError(res); }
}

export async function createContactRequestHandler(req: Request, res: Response): Promise<void> {
  try {
    const cr = await createContactRequest(getBid(req), req.body);
    created(res, cr);
  } catch { serverError(res); }
}

export async function updateContactRequestHandler(req: Request, res: Response): Promise<void> {
  try {
    const cr = await updateContactRequest(req.params.id, req.body);
    if (!cr) { notFound(res, "Contact request"); return; }
    ok(res, cr);
  } catch { serverError(res); }
}

export async function deleteContactRequestHandler(req: Request, res: Response): Promise<void> {
  try {
    const cr = await softDeleteContactRequest(req.params.id);
    if (!cr) { notFound(res, "Contact request"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}
