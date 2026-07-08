/**
 * Payment Provider Abstraction — Phase I.5/I.6
 *
 * Providers:
 *   ManualProvider  — staff-recorded payments, zero fees (default without Stripe)
 *   MockProvider    — deterministic test provider, simulates fees
 *   StripeProvider  — full production Stripe implementation (Phase I.6)
 *
 * BillingService API is unchanged — only this file gained real Stripe logic.
 */

import { config } from "../config.js";
import logger from "../logger.js";

export interface ChargeInput {
  amount:          number;         // in major units (e.g. 100.00 USD)
  currency:        string;
  description?:    string;
  metadata?:       Record<string, unknown>;
  customerId?:     string;         // Stripe customer id
  paymentMethodId?:string;         // Stripe payment method id
}

export interface ChargeResult {
  providerTxId: string;
  status:       "succeeded" | "pending" | "failed";
  fees:         number;            // in major units
  raw?:         unknown;
}

export interface RefundInput {
  providerTxId: string;
  amount?:      number;            // partial refund in major units; omit for full
  reason?:      string;
}

export interface RefundResult {
  refundId: string;
  status:   "succeeded" | "pending" | "failed";
}

export interface CreateCustomerInput {
  email:       string;
  name?:       string;
  metadata?:   Record<string, string>;
}

export interface CreateCheckoutInput {
  customerId?:  string;
  lineItems:    Array<{ name: string; amount: number; currency: string; quantity?: number }>;
  successUrl:   string;
  cancelUrl:    string;
  metadata?:    Record<string, string>;
}

export interface CreatePortalInput {
  customerId:  string;
  returnUrl:   string;
}

export interface SubscriptionSyncInput {
  stripeSubId:         string;
  status:              string;
  currentPeriodStart:  number;   // unix timestamp
  currentPeriodEnd:    number;
  cancelAtPeriodEnd:   boolean;
}

export interface IPaymentProvider {
  readonly name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(input: RefundInput): Promise<RefundResult>;
  createCustomer?(input: CreateCustomerInput): Promise<{ customerId: string }>;
  createCheckoutSession?(input: CreateCheckoutInput): Promise<{ sessionId: string; url: string }>;
  createPortalSession?(input: CreatePortalInput): Promise<{ url: string }>;
  constructWebhookEvent?(payload: Buffer | string, signature: string): Promise<unknown>;
}

// ─── Manual Provider ─────────────────────────────────────────────────────────

export class ManualProvider implements IPaymentProvider {
  readonly name = "manual";

  async charge(_input: ChargeInput): Promise<ChargeResult> {
    return {
      providerTxId: `MAN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: "succeeded",
      fees:   0,
    };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    return { refundId: `MREF-${Date.now()}`, status: "succeeded" };
  }
}

// ─── Mock Provider ────────────────────────────────────────────────────────────

export class MockProvider implements IPaymentProvider {
  readonly name = "mock";

  async charge(input: ChargeInput): Promise<ChargeResult> {
    return {
      providerTxId: `MOCK-${Date.now()}`,
      status: "succeeded",
      fees:   Math.round((input.amount * 0.029 + 0.30) * 100) / 100,
    };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    return { refundId: `MOCKREF-${Date.now()}`, status: "succeeded" };
  }
}

// ─── Stripe Provider ─────────────────────────────────────────────────────────

export class StripeProvider implements IPaymentProvider {
  readonly name = "stripe";

  private get stripe() {
    if (!config.stripeSecretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY is not configured. Set it in your environment variables."
      );
    }
    // Lazy import — Stripe SDK is only loaded when the provider is used
    const Stripe = require("stripe");
    return new Stripe(config.stripeSecretKey, {
      apiVersion: "2025-06-30.basil",
      typescript: true,
    });
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    const stripe = this.stripe;
    // Amount in cents (Stripe standard)
    const amountCents = Math.round(input.amount * 100);

    const intent = await stripe.paymentIntents.create({
      amount:       amountCents,
      currency:     input.currency.toLowerCase(),
      description:  input.description,
      customer:     input.customerId,
      payment_method: input.paymentMethodId,
      confirm:      !!input.paymentMethodId,
      automatic_payment_methods: input.paymentMethodId
        ? undefined
        : { enabled: true },
      metadata: input.metadata as Record<string, string> | undefined,
    });

    const statusMap: Record<string, ChargeResult["status"]> = {
      succeeded:              "succeeded",
      processing:             "pending",
      requires_payment_method:"failed",
      requires_action:        "pending",
      canceled:               "failed",
    };

    return {
      providerTxId: intent.id,
      status:       statusMap[intent.status] ?? "pending",
      fees:         0, // fees retrieved from balance transaction, not needed here
      raw:          intent,
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const stripe = this.stripe;
    const params: Record<string, unknown> = {
      payment_intent: input.providerTxId,
    };
    if (input.amount !== undefined) {
      params["amount"] = Math.round(input.amount * 100);
    }
    if (input.reason) {
      params["reason"] = input.reason;
    }

    const refund = await stripe.refunds.create(params as any);
    return {
      refundId: refund.id,
      status:   refund.status === "succeeded" ? "succeeded"
              : refund.status === "pending"   ? "pending"
              : "failed",
    };
  }

  async createCustomer(input: CreateCustomerInput): Promise<{ customerId: string }> {
    const stripe = this.stripe;
    const customer = await stripe.customers.create({
      email:    input.email,
      name:     input.name,
      metadata: input.metadata,
    });
    return { customerId: customer.id };
  }

  async createCheckoutSession(input: CreateCheckoutInput): Promise<{ sessionId: string; url: string }> {
    const stripe = this.stripe;
    const session = await stripe.checkout.sessions.create({
      customer:    input.customerId,
      mode:        "payment",
      line_items:  input.lineItems.map((item) => ({
        price_data: {
          currency:     item.currency.toLowerCase(),
          unit_amount:  Math.round(item.amount * 100),
          product_data: { name: item.name },
        },
        quantity: item.quantity ?? 1,
      })),
      success_url: input.successUrl,
      cancel_url:  input.cancelUrl,
      metadata:    input.metadata,
    });
    return { sessionId: session.id, url: session.url ?? "" };
  }

  async createPortalSession(input: CreatePortalInput): Promise<{ url: string }> {
    const stripe = this.stripe;
    const session = await stripe.billingPortal.sessions.create({
      customer:   input.customerId,
      return_url: input.returnUrl,
    });
    return { url: session.url };
  }

  async constructWebhookEvent(payload: Buffer | string, signature: string): Promise<unknown> {
    if (!config.stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    }
    const stripe = this.stripe;
    return stripe.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);
  }
}

// ─── Provider registry ────────────────────────────────────────────────────────

const providers: Record<string, IPaymentProvider> = {
  manual: new ManualProvider(),
  mock:   new MockProvider(),
  stripe: new StripeProvider(),
};

export function getProvider(name: string): IPaymentProvider {
  const p = providers[name];
  if (!p) throw new Error(`Unknown payment provider: ${name}`);
  return p;
}

export function getStripeProvider(): StripeProvider {
  return providers["stripe"] as StripeProvider;
}
