/**
 * Stripe Webhooks — Phase I.6
 *
 * All events arrive at POST /api/webhooks/stripe
 * Signature is verified before any processing.
 * Raw body is required — mounted BEFORE express.json().
 */

import { Router, Request, Response } from "express";
import express from "express";
import { getStripeProvider } from "../services/payment-provider.js";
import { paymentRepository } from "../../database/repositories/PaymentRepository.js";
import { subscriptionRepository } from "../../database/repositories/SubscriptionRepository.js";
import { invoiceRepository } from "../../database/repositories/InvoiceRepository.js";
import { config } from "../config.js";
import logger from "../logger.js";

const router = Router();

// Raw body parser — must come before global express.json()
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    if (!config.stripeWebhookSecret) {
      logger.warn("[Webhook] STRIPE_WEBHOOK_SECRET not set — webhook processing disabled");
      res.json({ received: true, processed: false });
      return;
    }

    let event: any;
    try {
      const provider = getStripeProvider();
      event = await provider.constructWebhookEvent(req.body as Buffer, sig as string);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn("[Webhook] Signature verification failed", { error: msg });
      res.status(400).json({ error: `Webhook signature invalid: ${msg}` });
      return;
    }

    const correlationId = event.id;
    const wLogger = logger.child({ correlationId, eventType: event.type });
    wLogger.info("[Webhook] Received", { stripeEventId: event.id });

    try {
      await handleStripeEvent(event, wLogger);
      res.json({ received: true, eventId: event.id });
    } catch (err) {
      wLogger.exception("[Webhook] Handler error", err, { eventType: event.type });
      // Return 200 so Stripe doesn't retry events we've partially processed
      res.json({ received: true, error: "Handler error — check logs" });
    }
  }
);

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleStripeEvent(event: any, log: typeof logger): Promise<void> {
  const data = event.data?.object ?? {};

  switch (event.type) {

    // ── Checkout completed ────────────────────────────────────────────────
    case "checkout.session.completed": {
      const sessionId    = data.id as string;
      const customerId   = data.customer as string | undefined;
      const paymentIntentId = data.payment_intent as string | undefined;
      const amountTotal  = (data.amount_total as number ?? 0) / 100;

      log.info("[Webhook] checkout.session.completed", { sessionId, amountTotal });

      if (paymentIntentId) {
        // Find and update any matching pending payment
        const payments = await paymentRepository.findMany({
          providerTxId: paymentIntentId,
          status: "pending",
          deletedAt: null,
        });
        for (const p of payments) {
          await paymentRepository.update(String(p._id), {
            status: "succeeded",
            paidAt: new Date(),
          });
          if (p.invoiceId) {
            await invoiceRepository.update(String(p.invoiceId), {
              status: "paid",
              paidAt: new Date(),
            });
          }
        }
      }
      break;
    }

    // ── Invoice paid ─────────────────────────────────────────────────────
    case "invoice.paid": {
      const stripeInvoiceId = data.id as string;
      const amountPaid      = (data.amount_paid as number ?? 0) / 100;
      const currency        = (data.currency as string ?? "usd").toUpperCase();
      const subId           = data.subscription as string | undefined;

      log.info("[Webhook] invoice.paid", { stripeInvoiceId, amountPaid });

      // Find matching subscription and record payment
      if (subId) {
        const subs = await subscriptionRepository.findMany({
          stripeSubId: subId,
          deletedAt: null,
        });
        for (const sub of subs) {
          await paymentRepository.create({
            businessId:     sub.businessId,
            subscriptionId: sub._id,
            provider:       "stripe",
            providerTxId:   stripeInvoiceId,
            amount:         amountPaid,
            currency,
            status:         "succeeded",
            paidAt:         new Date(),
            description:    `Stripe subscription payment — ${stripeInvoiceId}`,
          } as any);
        }
      }
      break;
    }

    // ── Invoice payment failed ────────────────────────────────────────────
    case "invoice.payment_failed": {
      const stripeInvoiceId = data.id as string;
      const subId           = data.subscription as string | undefined;
      log.warn("[Webhook] invoice.payment_failed", { stripeInvoiceId });

      if (subId) {
        const subs = await subscriptionRepository.findMany({
          stripeSubId: subId,
          deletedAt: null,
        });
        for (const sub of subs) {
          // Move to grace period
          const gracePeriodEndsAt = new Date();
          gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7);
          await subscriptionRepository.update(String(sub._id), {
            status: "grace_period",
            gracePeriodEndsAt,
          });
        }
      }
      break;
    }

    // ── Subscription created ──────────────────────────────────────────────
    case "customer.subscription.created": {
      const stripeSubId  = data.id as string;
      const customerId   = data.customer as string;
      const status       = data.status as string;
      log.info("[Webhook] customer.subscription.created", { stripeSubId, status });

      // Match local subscriptions by stripeSubId (already set at creation time)
      const subs = await subscriptionRepository.findMany({
        stripeSubId,
        deletedAt: null,
      });
      for (const sub of subs) {
        await subscriptionRepository.update(String(sub._id), {
          stripeCustomerId: customerId,
          status: mapStripeSubStatus(status),
          currentPeriodStart: new Date((data.current_period_start as number) * 1000),
          currentPeriodEnd:   new Date((data.current_period_end   as number) * 1000),
        });
      }
      break;
    }

    // ── Subscription updated ──────────────────────────────────────────────
    case "customer.subscription.updated": {
      const stripeSubId = data.id as string;
      const status      = data.status as string;
      log.info("[Webhook] customer.subscription.updated", { stripeSubId, status });

      const subs = await subscriptionRepository.findMany({
        stripeSubId,
        deletedAt: null,
      });
      for (const sub of subs) {
        await subscriptionRepository.update(String(sub._id), {
          status:             mapStripeSubStatus(status),
          cancelAtPeriodEnd:  data.cancel_at_period_end as boolean,
          currentPeriodStart: new Date((data.current_period_start as number) * 1000),
          currentPeriodEnd:   new Date((data.current_period_end   as number) * 1000),
        });
      }
      break;
    }

    // ── Subscription deleted ──────────────────────────────────────────────
    case "customer.subscription.deleted": {
      const stripeSubId = data.id as string;
      log.info("[Webhook] customer.subscription.deleted", { stripeSubId });

      const subs = await subscriptionRepository.findMany({
        stripeSubId,
        deletedAt: null,
      });
      for (const sub of subs) {
        await subscriptionRepository.update(String(sub._id), {
          status:      "cancelled",
          cancelledAt: new Date(),
        });
      }
      break;
    }

    // ── PaymentIntent succeeded ───────────────────────────────────────────
    case "payment_intent.succeeded": {
      const piId  = data.id as string;
      const amount = (data.amount_received as number ?? 0) / 100;
      log.info("[Webhook] payment_intent.succeeded", { piId, amount });

      const payments = await paymentRepository.findMany({
        providerTxId: piId,
        status: { $ne: "succeeded" },
        deletedAt: null,
      });
      for (const p of payments) {
        await paymentRepository.update(String(p._id), {
          status: "succeeded",
          paidAt: new Date(),
        });
        if (p.invoiceId) {
          await invoiceRepository.update(String(p.invoiceId), {
            status: "paid",
            paidAt: new Date(),
          });
        }
      }
      break;
    }

    // ── PaymentIntent failed ──────────────────────────────────────────────
    case "payment_intent.payment_failed": {
      const piId  = data.id as string;
      const reason = data.last_payment_error?.message as string | undefined;
      log.warn("[Webhook] payment_intent.payment_failed", { piId, reason });

      const payments = await paymentRepository.findMany({
        providerTxId: piId,
        status: "pending",
        deletedAt: null,
      });
      for (const p of payments) {
        await paymentRepository.update(String(p._id), {
          status:        "failed",
          failureReason: reason,
        });
      }
      break;
    }

    default:
      log.debug("[Webhook] Unhandled event type", { type: event.type });
  }
}

function mapStripeSubStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    trialing:           "trialing",
    active:             "active",
    past_due:           "grace_period",
    unpaid:             "grace_period",
    canceled:           "cancelled",
    incomplete:         "active",
    incomplete_expired: "cancelled",
    paused:             "paused",
  };
  return map[stripeStatus] ?? "active";
}

export default router;
