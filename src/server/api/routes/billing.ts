import { Router } from "express";
import { validateBody, validateQuery } from "../validate.js";
import { paginationSchema } from "../pagination.js";

// Billing
import {
  getBillingProfileHandler,
  updateBillingProfileHandler,
  getRevenueHandler,
  getBillingDashboardHandler,
} from "../controllers/billing.controller.js";

// Quotes
import {
  listQuotesHandler, getQuoteHandler, createQuoteHandler,
  updateQuoteHandler, deleteQuoteHandler, convertQuoteHandler,
  getQuoteStatsHandler,
} from "../controllers/quotes.controller.js";

// Payments
import {
  listPaymentsHandler, getPaymentHandler, createPaymentHandler,
  refundPaymentHandler, getPaymentStatsHandler, getPaymentsByInvoiceHandler,
} from "../controllers/payments.controller.js";

// Subscriptions
import {
  listSubscriptionsHandler, getSubscriptionHandler, createSubscriptionHandler,
  updateSubscriptionHandler, cancelSubscriptionHandler,
  pauseSubscriptionHandler, resumeSubscriptionHandler,
  getSubscriptionStatsHandler, getUpcomingRenewalsHandler,
} from "../controllers/subscriptions.controller.js";

// Coupons
import {
  listCouponsHandler, getCouponHandler, createCouponHandler,
  updateCouponHandler, deleteCouponHandler, validateCouponHandler,
} from "../controllers/coupons.controller.js";

// Tax Rates
import {
  listTaxRatesHandler, getTaxRateHandler, createTaxRateHandler,
  updateTaxRateHandler, deleteTaxRateHandler, getActiveTaxRatesHandler,
} from "../controllers/tax-rates.controller.js";

// Schemas
import {
  updateBillingProfileSchema,
  createQuoteSchema, updateQuoteSchema,
  createPaymentSchema, refundPaymentSchema,
  createSubscriptionSchema, updateSubscriptionSchema, cancelSubscriptionSchema,
  createCouponSchema, updateCouponSchema, validateCouponSchema,
  createTaxRateSchema, updateTaxRateSchema,
} from "../billing-schemas.js";

const billing = Router();

// ── Billing Profile ───────────────────────────────────────────────────────────
billing.get  ("/billing/profile",   getBillingProfileHandler);
billing.patch("/billing/profile",   validateBody(updateBillingProfileSchema), updateBillingProfileHandler);

// ── Revenue & Dashboard ───────────────────────────────────────────────────────
billing.get  ("/billing/revenue",   getRevenueHandler);
billing.get  ("/billing/dashboard", getBillingDashboardHandler);

// ── Quotes ────────────────────────────────────────────────────────────────────
billing.get  ("/quotes/stats",              getQuoteStatsHandler);
billing.get  ("/quotes",                    listQuotesHandler);
billing.get  ("/quotes/:id",                getQuoteHandler);
billing.post ("/quotes",                    validateBody(createQuoteSchema),  createQuoteHandler);
billing.patch("/quotes/:id",                validateBody(updateQuoteSchema),  updateQuoteHandler);
billing.delete("/quotes/:id",               deleteQuoteHandler);
billing.post ("/quotes/:id/convert",        convertQuoteHandler);

// ── Payments ──────────────────────────────────────────────────────────────────
billing.get  ("/payments/stats",            getPaymentStatsHandler);
billing.get  ("/payments",                  listPaymentsHandler);
billing.get  ("/payments/:id",              getPaymentHandler);
billing.post ("/payments",                  validateBody(createPaymentSchema), createPaymentHandler);
billing.post ("/payments/:id/refund",       validateBody(refundPaymentSchema), refundPaymentHandler);
billing.get  ("/invoices/:invoiceId/payments", getPaymentsByInvoiceHandler);

// ── Subscriptions ─────────────────────────────────────────────────────────────
billing.get  ("/subscriptions/stats",           getSubscriptionStatsHandler);
billing.get  ("/subscriptions/renewals",        getUpcomingRenewalsHandler);
billing.get  ("/subscriptions",                 listSubscriptionsHandler);
billing.get  ("/subscriptions/:id",             getSubscriptionHandler);
billing.post ("/subscriptions",                 validateBody(createSubscriptionSchema), createSubscriptionHandler);
billing.patch("/subscriptions/:id",             validateBody(updateSubscriptionSchema), updateSubscriptionHandler);
billing.post ("/subscriptions/:id/cancel",      validateBody(cancelSubscriptionSchema), cancelSubscriptionHandler);
billing.post ("/subscriptions/:id/pause",       pauseSubscriptionHandler);
billing.post ("/subscriptions/:id/resume",      resumeSubscriptionHandler);

// ── Coupons ───────────────────────────────────────────────────────────────────
billing.get  ("/coupons",                   listCouponsHandler);
billing.get  ("/coupons/:id",               getCouponHandler);
billing.post ("/coupons",                   validateBody(createCouponSchema),   createCouponHandler);
billing.patch("/coupons/:id",               validateBody(updateCouponSchema),   updateCouponHandler);
billing.delete("/coupons/:id",              deleteCouponHandler);
billing.post ("/coupons/validate",          validateBody(validateCouponSchema), validateCouponHandler);

// ── Tax Rates ─────────────────────────────────────────────────────────────────
billing.get  ("/tax-rates/active",          getActiveTaxRatesHandler);
billing.get  ("/tax-rates",                 listTaxRatesHandler);
billing.get  ("/tax-rates/:id",             getTaxRateHandler);
billing.post ("/tax-rates",                 validateBody(createTaxRateSchema),  createTaxRateHandler);
billing.patch("/tax-rates/:id",             validateBody(updateTaxRateSchema),  updateTaxRateHandler);
billing.delete("/tax-rates/:id",            deleteTaxRateHandler);

export default billing;
