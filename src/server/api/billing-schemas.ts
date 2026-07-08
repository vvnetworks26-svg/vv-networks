import { z } from "zod";

// ── Billing Profile ───────────────────────────────────────────────────────────
export const updateBillingProfileSchema = z.object({
  companyName:             z.string().max(200).optional(),
  vatNumber:               z.string().max(50).optional(),
  taxId:                   z.string().max(50).optional(),
  billingEmail:            z.string().email().optional(),
  defaultCurrency:         z.string().length(3).optional(),
  defaultPaymentTermsDays: z.number().int().min(0).max(365).optional(),
  address: z.object({
    line1:      z.string().min(1),
    line2:      z.string().optional(),
    city:       z.string().min(1),
    state:      z.string().optional(),
    postalCode: z.string().optional(),
    country:    z.string().length(2).default("US"),
  }).optional(),
});

// ── Line Items (shared) ───────────────────────────────────────────────────────
const lineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity:    z.number().min(0),
  unitPrice:   z.number().min(0),
  total:       z.number().min(0).optional(),
});

// ── Quotes ────────────────────────────────────────────────────────────────────
export const createQuoteSchema = z.object({
  clientId:        z.string().optional(),
  projectId:       z.string().optional(),
  title:           z.string().min(1).max(200),
  lineItems:       z.array(lineItemSchema).min(1),
  discountPercent: z.number().min(0).max(100).default(0),
  taxRate:         z.number().min(0).max(100).default(0),
  currency:        z.string().length(3).default("USD"),
  validUntil:      z.string().datetime().optional(),
  notes:           z.string().max(3000).optional(),
  terms:           z.string().max(3000).optional(),
});

export const updateQuoteSchema = createQuoteSchema.partial().extend({
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
});

// ── Payments ──────────────────────────────────────────────────────────────────
export const createPaymentSchema = z.object({
  invoiceId:      z.string().optional(),
  subscriptionId: z.string().optional(),
  clientId:       z.string().optional(),
  provider:       z.enum(["manual", "mock", "stripe"]).default("manual"),
  amount:         z.number().min(0.01),
  currency:       z.string().length(3).default("USD"),
  description:    z.string().max(500).optional(),
  metadata:       z.record(z.unknown()).optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().min(0.01).optional(),
  reason: z.string().max(500).optional(),
});

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const createSubscriptionSchema = z.object({
  clientId:       z.string().optional(),
  serviceId:      z.string().optional(),
  name:           z.string().min(1).max(200),
  interval:       z.enum(["monthly", "quarterly", "annual"]),
  amount:         z.number().min(0),
  currency:       z.string().length(3).default("USD"),
  trialDays:      z.number().int().min(0).optional(),
  couponId:       z.string().optional(),
  discountAmount: z.number().min(0).default(0),
  metadata:       z.record(z.unknown()).optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial().extend({
  status: z.enum(["trialing","active","paused","grace_period","cancelled","expired"]).optional(),
});

export const cancelSubscriptionSchema = z.object({
  atPeriodEnd: z.boolean().default(true),
});

// ── Coupons ───────────────────────────────────────────────────────────────────
export const createCouponSchema = z.object({
  code:        z.string().min(1).max(50).transform((v) => v.toUpperCase()),
  type:        z.enum(["percentage", "fixed"]),
  value:       z.number().min(0),
  currency:    z.string().length(3).default("USD"),
  description: z.string().max(500).optional(),
  maxUses:     z.number().int().min(1).optional(),
  expiresAt:   z.string().datetime().optional(),
  isActive:    z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code:     z.string().min(1),
  subtotal: z.number().min(0),
});

// ── Tax Rates ─────────────────────────────────────────────────────────────────
export const createTaxRateSchema = z.object({
  name:        z.string().min(1).max(100),
  rate:        z.number().min(0).max(100),
  country:     z.string().max(2).optional(),
  state:       z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  isDefault:   z.boolean().default(false),
  isActive:    z.boolean().default(true),
});

export const updateTaxRateSchema = createTaxRateSchema.partial();
