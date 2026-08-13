# VV Networks — Billing/CRM Removal (M0 cleanup)

Decision: the billing/CRM backend (Stripe invoicing, subscriptions, quotes,
projects, coupons, tax) was speculative scope creep unrelated to a marketing
site and has been removed entirely.

This is a **working-tree snapshot**, not a git repo — diff it against your
actual `vv-networks` repo and apply the deletions/edits there (or replace
the relevant files directly). `node_modules/`, `dist/`, `.env`, and `.DS_Store`
were stripped before packaging; re-run `npm install` and restore your own
`.env` locally.

Verified clean: `npx tsc --noEmit` → 0 errors. `npm run build` → client
(Vite) and server (esbuild) bundles both build successfully.

## Deleted files

**Models** (`src/database/models/`)
`BillingProfile.ts`, `Invoice.ts`, `Payment.ts`, `PaymentMethod.ts`,
`Subscription.ts`, `Coupon.ts`, `TaxRate.ts`, `Quote.ts`, `Project.ts`

**Repositories** (`src/database/repositories/`)
`BillingProfileRepository.ts`, `InvoiceRepository.ts`, `PaymentRepository.ts`,
`PaymentMethodRepository.ts`, `SubscriptionRepository.ts`, `CouponRepository.ts`,
`TaxRateRepository.ts`, `QuoteRepository.ts`, `ProjectRepository.ts`

**Services** (`src/server/services/`)
`billing.service.ts`, `payment-provider.ts`, `payment.service.ts`,
`invoice.service.ts`, `subscription.service.ts`, `coupon.service.ts`,
`tax.service.ts`, `quote.service.ts`, `project.service.ts`, `revenue.service.ts`

**Controllers** (`src/server/api/controllers/`)
`billing.controller.ts`, `payments.controller.ts`, `invoices.controller.ts`,
`subscriptions.controller.ts`, `coupons.controller.ts`, `tax-rates.controller.ts`,
`quotes.controller.ts`, `projects.controller.ts`

**Routes / schemas**
`src/server/api/routes/billing.ts`, `src/server/routes/webhooks.routes.ts`
(Stripe webhook handler), `src/server/api/billing-schemas.ts`

## Edited files

| File | Change |
|---|---|
| `src/database/index.ts` | Removed barrel exports for the 9 deleted models/repos |
| `src/database/indexes.ts` | Removed imports + index registration for deleted models |
| `src/server/api/schemas.ts` | Removed `createProjectSchema`/`updateProjectSchema`/`createInvoiceSchema`/`updateInvoiceSchema`/`lineItemSchema` |
| `src/server/api/routes/v1.ts` | Removed Project/Invoice imports + route registrations, removed `billingRouter` mount |
| `src/server/app.ts` | Removed webhook router mount, `Stripe-Signature` CORS header, `api.stripe.com` CSP entry |
| `src/server/services/scheduler.service.ts` | Removed `billing:invoice-reminders` and `billing:subscription-check` cron jobs (they lazy-imported deleted models — would have crashed at runtime) |
| `src/database/seed.ts` | Removed Project/Invoice seeding blocks and renumbered remaining seed steps |
| `src/server/config.ts` | Removed `stripeSecretKey`, `stripeWebhookSecret`, `stripePublishableKey` |
| `src/server/env-validator.ts` | Removed the (non-blocking, `optional`) Stripe env validation rules |
| `package.json` | Removed `stripe` dependency; renamed package from leftover `"react-example"` to `"vv-networks"` |
| `.env.example` | Removed `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |

## Left untouched (separate decision, not part of this cut)

`Operations` (Phase I.7): `alert.service.ts`, `backup.service.ts`,
`error-tracking.service.ts`, `feature-flags.service.ts`, `metrics.service.ts`,
`performance.service.ts`, `scheduler.service.ts` (jobs trimmed, service kept),
`operations.controller.ts`/`routes/operations.ts`, `monitoring.routes.ts`.
A few of these still reference string labels like `"billing.stripe"` (feature
flag key) or `METRIC.STRIPE_EVENTS` (metric name) — these are just unused
label strings now, harmless, but worth a pass if you want them fully clean.
You didn't ask to cut this cluster — flagging it as a separate decision for
later, same as the original assessment.

## Also noticed, not fixed

`vite build` reports one JS chunk at 862 kB post-minification (pre-existing,
unrelated to this cleanup) — worth code-splitting at some point, not urgent.
