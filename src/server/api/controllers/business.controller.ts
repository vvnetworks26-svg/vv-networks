import type { Request, Response } from "express";
import { ok, notFound, serverError } from "../response.js";
import { getBid } from "../middleware.js";
import { getBusiness, updateBusiness } from "../../services/business.service.js";

export async function getBusinessHandler(req: Request, res: Response): Promise<void> {
  try {
    const biz = await getBusiness();
    if (!biz) { notFound(res, "Business"); return; }
    ok(res, biz);
  } catch { serverError(res); }
}

export async function updateBusinessHandler(req: Request, res: Response): Promise<void> {
  try {
    const biz = await getBusiness();
    if (!biz) { notFound(res, "Business"); return; }
    const updated = await updateBusiness(String(biz._id), req.body);
    ok(res, updated);
  } catch { serverError(res); }
}
