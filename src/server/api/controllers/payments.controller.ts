import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated, badRequest } from "../response.js";
import { getBid } from "../middleware.js";
import {
  recordPayment, listPayments, getPayment,
  refundPayment, getPaymentStats, getPaymentsByInvoice,
} from "../../services/payment.service.js";

export async function listPaymentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await listPayments(getBid(req), +page, +limit);
    paginated(res, result.data, {
      page: result.page, limit: +limit,
      total: result.total, totalPages: result.totalPages,
      hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch { serverError(res); }
}

export async function getPaymentHandler(req: Request, res: Response): Promise<void> {
  try {
    const payment = await getPayment(req.params.id);
    if (!payment) { notFound(res, "Payment"); return; }
    ok(res, payment);
  } catch { serverError(res); }
}

export async function createPaymentHandler(req: Request, res: Response): Promise<void> {
  try {
    const payment = await recordPayment(getBid(req), req.body);
    created(res, payment);
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message, code: err.code });
  }
}

export async function refundPaymentHandler(req: Request, res: Response): Promise<void> {
  try {
    const { amount, reason } = req.body as { amount?: number; reason?: string };
    const payment = await refundPayment(req.params.id, amount, reason);
    if (!payment) { notFound(res, "Payment"); return; }
    ok(res, payment);
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function getPaymentStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getPaymentStats(getBid(req));
    ok(res, stats);
  } catch { serverError(res); }
}

export async function getPaymentsByInvoiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const payments = await getPaymentsByInvoice(req.params.invoiceId);
    ok(res, payments);
  } catch { serverError(res); }
}
