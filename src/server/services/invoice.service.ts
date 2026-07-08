import { invoiceRepository } from "../../database/repositories/InvoiceRepository.js";
import type { IInvoice, InvoiceStatus } from "../../database/models/Invoice.js";
import metricsService, { METRIC } from "./metrics.service.js";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface CreateInvoiceInput {
  projectId?: string;
  clientId?: string;
  lineItems: InvoiceLineItem[];
  taxRate?: number;
  discountAmount?: number;
  currency?: string;
  issuedAt?: Date | string;
  dueAt?: Date | string;
  notes?: string;
  status?: InvoiceStatus;
}

function computeInvoiceTotals(
  lineItems: InvoiceLineItem[],
  taxRate = 0,
  discountAmount = 0
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal   = lineItems.reduce((s, i) => s + (i.total ?? i.quantity * i.unitPrice), 0);
  const taxable    = Math.max(0, subtotal - discountAmount);
  const taxAmount  = Math.round(taxable * (taxRate / 100) * 100) / 100;
  const total      = Math.round((taxable + taxAmount) * 100) / 100;
  return { subtotal, taxAmount, total };
}

export async function createInvoice(
  businessId: string,
  data: CreateInvoiceInput
): Promise<IInvoice> {
  const invoiceNumber = await invoiceRepository.getNextInvoiceNumber(businessId);
  const lineItems     = data.lineItems.map((i) => ({ ...i, total: i.total ?? i.quantity * i.unitPrice }));
  const totals        = computeInvoiceTotals(lineItems, data.taxRate, data.discountAmount);

  const invoice = await invoiceRepository.create({
    businessId,
    invoiceNumber,
    projectId:  data.projectId,
    clientId:   data.clientId,
    lineItems,
    taxRate:    data.taxRate ?? 0,
    currency:   data.currency ?? "USD",
    issuedAt:   data.issuedAt ? new Date(data.issuedAt as string) : undefined,
    dueAt:      data.dueAt    ? new Date(data.dueAt    as string) : undefined,
    notes:      data.notes,
    status:     data.status ?? "draft",
    ...totals,
  } as unknown as Partial<IInvoice>);
  metricsService.increment(METRIC.INVOICES_CREATED);
  return invoice;
}

export async function updateInvoice(
  id: string,
  data: Partial<IInvoice>
): Promise<IInvoice | null> {
  const update: Record<string, unknown> = { ...data };

  // Auto-set paidAt when marking as paid
  if (data.status === "paid" && !data.paidAt) {
    update["paidAt"] = new Date();
    metricsService.increment(METRIC.INVOICES_PAID);
  }

  // Recompute totals if line items changed
  if (data.lineItems) {
    const lineItems  = data.lineItems.map((i) => ({ ...i, total: i.total ?? i.quantity * i.unitPrice }));
    const totals     = computeInvoiceTotals(
      lineItems,
      (data.taxRate as number | undefined) ?? undefined,
      undefined
    );
    Object.assign(update, { lineItems, ...totals });
  }

  return invoiceRepository.update(id, update);
}

export async function softDeleteInvoice(id: string): Promise<IInvoice | null> {
  return invoiceRepository.softDelete(id);
}

export async function markOverdueInvoices(businessId: string): Promise<number> {
  const overdue = await invoiceRepository.findOverdue(businessId);
  let count = 0;
  for (const inv of overdue) {
    await invoiceRepository.update(String(inv._id), { status: "overdue" });
    count++;
  }
  return count;
}

export async function getInvoiceStats(businessId: string): Promise<ReturnType<typeof invoiceRepository.getRevenueStats>> {
  return invoiceRepository.getRevenueStats(businessId);
}
