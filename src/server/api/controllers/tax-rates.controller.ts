import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import {
  listTaxRates, getTaxRate, createTaxRate,
  updateTaxRate, deleteTaxRate, getActiveTaxRates,
} from "../../services/tax.service.js";

export async function listTaxRatesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await listTaxRates(getBid(req), +page, +limit);
    paginated(res, result.data, {
      page: result.page, limit: +limit,
      total: result.total, totalPages: result.totalPages,
      hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch { serverError(res); }
}

export async function getActiveTaxRatesHandler(req: Request, res: Response): Promise<void> {
  try {
    const rates = await getActiveTaxRates(getBid(req));
    ok(res, rates);
  } catch { serverError(res); }
}

export async function getTaxRateHandler(req: Request, res: Response): Promise<void> {
  try {
    const rate = await getTaxRate(req.params.id);
    if (!rate) { notFound(res, "Tax rate"); return; }
    ok(res, rate);
  } catch { serverError(res); }
}

export async function createTaxRateHandler(req: Request, res: Response): Promise<void> {
  try {
    const rate = await createTaxRate(getBid(req), req.body);
    created(res, rate);
  } catch { serverError(res); }
}

export async function updateTaxRateHandler(req: Request, res: Response): Promise<void> {
  try {
    const rate = await updateTaxRate(req.params.id, req.body);
    if (!rate) { notFound(res, "Tax rate"); return; }
    ok(res, rate);
  } catch { serverError(res); }
}

export async function deleteTaxRateHandler(req: Request, res: Response): Promise<void> {
  try {
    const rate = await deleteTaxRate(req.params.id);
    if (!rate) { notFound(res, "Tax rate"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}
