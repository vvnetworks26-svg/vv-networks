import { paymentRepository } from "../../database/repositories/PaymentRepository.js";
import { invoiceRepository } from "../../database/repositories/InvoiceRepository.js";
import { getProvider } from "./payment-provider.js";
import type { IPayment, PaymentProvider } from "../../database/models/Payment.js";
import metricsService, { METRIC } from "./metrics.service.js";

export interface RecordPaymentInput {
  invoiceId?: string;
  subscriptionId?: string;
  clientId?: string;
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records and processes a payment through the specified provider.
 * Automatically marks the invoice as paid when fully covered.
 */
export async function recordPayment(
  businessId: string,
  input: RecordPaymentInput
): Promise<IPayment> {
  const provider = getProvider(input.provider);

  const result = await provider.charge({
    amount: Math.round(input.amount * 100), // convert to cents for providers
    currency: input.currency ?? "USD",
    description: input.description,
    metadata: input.metadata,
  });

  const payment = await paymentRepository.create({
    businessId,
    invoiceId:      input.invoiceId,
    subscriptionId: input.subscriptionId,
    clientId:       input.clientId,
    provider:       input.provider,
    providerTxId:   result.providerTxId,
    amount:         input.amount,
    currency:       input.currency ?? "USD",
    fees:           result.fees / 100,
    status:         result.status,
    paidAt:         result.status === "succeeded" ? new Date() : undefined,
    description:    input.description,
    metadata:       input.metadata,
  } as unknown as Partial<IPayment>);

  if (result.status === "succeeded") {
    metricsService.increment(METRIC.PAYMENTS_RECORDED);
    metricsService.increment(METRIC.REVENUE_COLLECTED_CENTS, Math.round(input.amount * 100));
  } else if (result.status === "failed") {
    metricsService.increment(METRIC.PAYMENTS_FAILED);
  }

  // Auto-mark invoice as paid if this payment covers it
  if (result.status === "succeeded" && input.invoiceId) {
    const invoice = await invoiceRepository.findById(input.invoiceId);
    if (invoice && invoice.status !== "paid") {
      await invoiceRepository.update(input.invoiceId, {
        status: "paid",
        paidAt: new Date(),
      });
    }
  }

  return payment;
}

export async function listPayments(
  businessId: string,
  page = 1,
  limit = 20
): Promise<ReturnType<typeof paymentRepository.findByBusiness>> {
  return paymentRepository.findByBusiness(businessId, { page, limit });
}

export async function getPayment(id: string): Promise<IPayment | null> {
  return paymentRepository.findById(id);
}

export async function getPaymentsByInvoice(invoiceId: string): Promise<IPayment[]> {
  return paymentRepository.findByInvoice(invoiceId);
}

export async function refundPayment(
  id: string,
  amount?: number,
  reason?: string
): Promise<IPayment | null> {
  const payment = await paymentRepository.findById(id);
  if (!payment) return null;
  if (payment.status !== "succeeded") {
    throw Object.assign(new Error("Only succeeded payments can be refunded"), { status: 400 });
  }

  const provider = getProvider(payment.provider);
  const refundResult = await provider.refund({
    providerTxId: payment.providerTxId ?? "",
    amount: amount ? Math.round(amount * 100) : undefined,
    reason,
  });

  if (refundResult.status !== "succeeded") {
    throw Object.assign(new Error("Refund failed at provider"), { status: 502 });
  }

  const refundedAmount = (payment.refundedAmount ?? 0) + (amount ?? payment.amount);
  const isFullRefund = refundedAmount >= payment.amount;

  return paymentRepository.update(id, {
    status:         isFullRefund ? "refunded" : "partial_refund",
    refundedAmount,
  });
}

export async function getPaymentStats(businessId: string): Promise<ReturnType<typeof paymentRepository.getStats>> {
  return paymentRepository.getStats(businessId);
}
