import { quoteRepository } from "../../database/repositories/QuoteRepository.js";
import { invoiceRepository } from "../../database/repositories/InvoiceRepository.js";
import type { IQuote } from "../../database/models/Quote.js";
import type { IInvoice } from "../../database/models/Invoice.js";

export interface QuoteInput {
  clientId?: string;
  projectId?: string;
  title: string;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  discountPercent?: number;
  taxRate?: number;
  currency?: string;
  validUntil?: Date | string;
  notes?: string;
  terms?: string;
}

function computeTotals(
  lineItems: Array<{ quantity: number; unitPrice: number; total?: number }>,
  discountPercent = 0,
  taxRate = 0
): { subtotal: number; discountAmount: number; taxAmount: number; total: number } {
  const subtotal      = lineItems.reduce((s, i) => s + (i.total ?? i.quantity * i.unitPrice), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const taxable        = subtotal - discountAmount;
  const taxAmount      = Math.round(taxable * (taxRate / 100) * 100) / 100;
  const total          = Math.round((taxable + taxAmount) * 100) / 100;
  return { subtotal, discountAmount, taxAmount, total };
}

export async function createQuote(businessId: string, data: QuoteInput): Promise<IQuote> {
  const quoteNumber = await quoteRepository.getNextQuoteNumber(businessId);
  const lineItems   = data.lineItems.map((i) => ({ ...i, total: i.total ?? i.quantity * i.unitPrice }));
  const totals      = computeTotals(lineItems, data.discountPercent, data.taxRate);

  return quoteRepository.create({
    businessId,
    quoteNumber,
    title:           data.title,
    clientId:        data.clientId,
    projectId:       data.projectId,
    lineItems,
    discountPercent: data.discountPercent ?? 0,
    taxRate:         data.taxRate ?? 0,
    currency:        data.currency ?? "USD",
    validUntil:      data.validUntil ? new Date(data.validUntil) : undefined,
    notes:           data.notes,
    terms:           data.terms,
    ...totals,
    status: "draft",
  } as unknown as Partial<IQuote>);
}

export async function listQuotes(
  businessId: string,
  page = 1,
  limit = 20
): Promise<ReturnType<typeof quoteRepository.findByBusiness>> {
  return quoteRepository.findByBusiness(businessId, { page, limit });
}

export async function getQuote(id: string): Promise<IQuote | null> {
  return quoteRepository.findById(id);
}

export async function updateQuote(id: string, data: Partial<IQuote>): Promise<IQuote | null> {
  // Recompute totals if line items changed
  if (data.lineItems) {
    const lineItems = data.lineItems.map((i) => ({ ...i, total: i.total ?? i.quantity * i.unitPrice }));
    const totals    = computeTotals(lineItems, data.discountPercent, data.taxRate);
    Object.assign(data, { lineItems, ...totals });
  }

  // Set timestamps for status transitions
  const now = new Date();
  if (data.status === "sent"     && !data.sentAt)     (data as any).sentAt     = now;
  if (data.status === "accepted" && !data.acceptedAt) (data as any).acceptedAt = now;
  if (data.status === "rejected" && !data.rejectedAt) (data as any).rejectedAt = now;

  return quoteRepository.update(id, data);
}

export async function deleteQuote(id: string): Promise<IQuote | null> {
  return quoteRepository.softDelete(id);
}

/**
 * Converts a quote into a new invoice.
 * Sets quote status to "converted" and stores the resulting invoice ID.
 */
export async function convertQuoteToInvoice(quoteId: string): Promise<IInvoice> {
  const quote = await quoteRepository.findById(quoteId);
  if (!quote) throw Object.assign(new Error("Quote not found"), { status: 404 });
  if (quote.status === "converted") {
    throw Object.assign(new Error("Quote has already been converted"), { status: 409 });
  }
  if (quote.status !== "accepted") {
    throw Object.assign(new Error("Only accepted quotes can be converted to invoices"), { status: 422 });
  }

  const invoiceNumber = await invoiceRepository.getNextInvoiceNumber(String(quote.businessId));

  const invoice = await invoiceRepository.create({
    businessId:    quote.businessId,
    projectId:     quote.projectId,
    clientId:      quote.clientId,
    invoiceNumber,
    status:        "draft",
    lineItems:     quote.lineItems,
    subtotal:      quote.subtotal,
    taxRate:       quote.taxRate,
    taxAmount:     quote.taxAmount,
    total:         quote.total,
    currency:      quote.currency,
    notes:         quote.notes,
  } as unknown as Partial<IInvoice>);

  // Mark quote as converted
  await quoteRepository.update(quoteId, {
    status: "converted",
    convertedInvoiceId: invoice._id,
  });

  return invoice;
}

export async function getQuoteStats(businessId: string): Promise<ReturnType<typeof quoteRepository.getStats>> {
  return quoteRepository.getStats(businessId);
}
