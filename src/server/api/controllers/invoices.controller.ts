import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import { invoiceRepository } from "../../../database/repositories/InvoiceRepository.js";
import { createInvoice, updateInvoice, softDeleteInvoice } from "../../services/invoice.service.js";

export async function listInvoices(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await invoiceRepository.findByBusiness(getBid(req), { page: +page, limit: +limit });
    paginated(res, result.data, { page: result.page, limit: +limit, total: result.total, totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev });
  } catch { serverError(res); }
}

export async function listOverdueInvoices(req: Request, res: Response): Promise<void> {
  try {
    const invoices = await invoiceRepository.findOverdue(getBid(req));
    ok(res, invoices);
  } catch { serverError(res); }
}

export async function getInvoice(req: Request, res: Response): Promise<void> {
  try {
    const invoice = await invoiceRepository.findById(req.params.id);
    if (!invoice) { notFound(res, "Invoice"); return; }
    ok(res, invoice);
  } catch { serverError(res); }
}

export async function createInvoiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const invoice = await createInvoice(getBid(req), req.body);
    created(res, invoice);
  } catch { serverError(res); }
}

export async function updateInvoiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const invoice = await updateInvoice(req.params.id, req.body);
    if (!invoice) { notFound(res, "Invoice"); return; }
    ok(res, invoice);
  } catch { serverError(res); }
}

export async function deleteInvoiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const invoice = await softDeleteInvoice(req.params.id);
    if (!invoice) { notFound(res, "Invoice"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}
