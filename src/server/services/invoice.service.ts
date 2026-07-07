import { invoiceRepository } from "../../database/repositories/InvoiceRepository.js";
import type { IInvoice } from "../../database/models/Invoice.js";

export async function createInvoice(businessId: string, data: Partial<IInvoice>): Promise<IInvoice> {
  const invoiceNumber = await invoiceRepository.getNextInvoiceNumber(businessId);
  const lineItems = (data.lineItems ?? []) as Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * ((data.taxRate ?? 0) / 100);
  return invoiceRepository.create({
    ...data, businessId, invoiceNumber,
    subtotal, taxAmount, total: subtotal + taxAmount,
  } as unknown as Partial<IInvoice>);
}
export async function updateInvoice(id: string, data: Partial<IInvoice>): Promise<IInvoice | null> {
  const update: Partial<IInvoice> & { paidAt?: Date } = { ...data };
  if ((data as any).status === "paid" && !update.paidAt) update.paidAt = new Date();
  return invoiceRepository.update(id, update);
}
export async function softDeleteInvoice(id: string): Promise<IInvoice | null> {
  return invoiceRepository.softDelete(id);
}
