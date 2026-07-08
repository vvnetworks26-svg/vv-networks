import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated, badRequest } from "../response.js";
import { getBid } from "../middleware.js";
import {
  createQuote, listQuotes, getQuote, updateQuote,
  deleteQuote, convertQuoteToInvoice, getQuoteStats,
} from "../../services/quote.service.js";

export async function listQuotesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await listQuotes(getBid(req), +page, +limit);
    paginated(res, result.data, {
      page: result.page, limit: +limit,
      total: result.total, totalPages: result.totalPages,
      hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch { serverError(res); }
}

export async function getQuoteHandler(req: Request, res: Response): Promise<void> {
  try {
    const quote = await getQuote(req.params.id);
    if (!quote) { notFound(res, "Quote"); return; }
    ok(res, quote);
  } catch { serverError(res); }
}

export async function createQuoteHandler(req: Request, res: Response): Promise<void> {
  try {
    const quote = await createQuote(getBid(req), req.body);
    created(res, quote);
  } catch (err: any) {
    if (err.status) { res.status(err.status).json({ success: false, error: err.message }); return; }
    serverError(res);
  }
}

export async function updateQuoteHandler(req: Request, res: Response): Promise<void> {
  try {
    const quote = await updateQuote(req.params.id, req.body);
    if (!quote) { notFound(res, "Quote"); return; }
    ok(res, quote);
  } catch { serverError(res); }
}

export async function deleteQuoteHandler(req: Request, res: Response): Promise<void> {
  try {
    const quote = await deleteQuote(req.params.id);
    if (!quote) { notFound(res, "Quote"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}

export async function convertQuoteHandler(req: Request, res: Response): Promise<void> {
  try {
    const invoice = await convertQuoteToInvoice(req.params.id);
    created(res, invoice);
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function getQuoteStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getQuoteStats(getBid(req));
    ok(res, stats);
  } catch { serverError(res); }
}
