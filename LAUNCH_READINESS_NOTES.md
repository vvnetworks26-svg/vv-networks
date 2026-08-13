# VV Networks — v1 Launch-Readiness Fixes

This session's changes, on top of the earlier billing/CRM removal
(see CLEANUP_NOTES.md). Verified clean: `npx tsc --noEmit` → 0 errors,
`npm run build` → client (Vite) and server (esbuild) both build successfully.

## Critical fixes

**Fake contact form** — the "Book My Strategy Session" form
(`src/components/contact/BookingForm.tsx`) called a `mockSubmit()` stub
that waited 1.2s and showed a fake success message. Real submissions went
nowhere. Now calls the real `POST /api/v1/contact-requests` endpoint (which
already existed, field-for-field matched, just wasn't wired up), with proper
error handling and a visible failure state.

**Fabricated case-study claim** — the LeadFlow case study
(`src/components/portfolio/projectData.ts`) publicly claimed *"One client
captured $124,000 in additional pipeline"* and a *"4.2× conversion"* badge,
despite LeadFlow having no real customers yet. Rewrote the claim to honest,
forward-looking language and removed the fabricated metric badge (it was
rendered prominently in both `CaseStudyPanel.tsx` and `FeaturedProject.tsx`).

**Booking data loss** — `src/server/services/booking.service.ts` stored
bookings in a plain in-memory array with a comment saying "replace with
MongoDB in production." Every server restart/redeploy erased all bookings
made through the site's primary CTA ("Book Team Demo," appears in the header,
hero, and footer). Rewritten to persist a real `Lead` + linked `Appointment`
via the existing repositories — no new data model invented, reuses the CRM
schema that was already built and otherwise unused for this flow.

**Public PII leak** — `GET /api/bookings` was a fully public, unauthenticated
endpoint returning every past booker's name, email, company, and notes to any
caller. Deleted entirely. The "watch it sync live" dashboard effect
(`InteractiveDashboard.tsx`) now receives the current visitor's own booking
data directly via React props/state instead of polling a global endpoint —
no other visitor's data ever reaches the browser.

**Hardcoded past dates** — `BookingModal.tsx`'s date picker was hardcoded to
five specific dates in July 2026, now in the past (today is August 11, 2026).
Any visitor opening the modal would see already-elapsed dates. Replaced with
a `useMemo` that computes the next 5 real weekdays on every render, with
correct "Tomorrow" labeling (only applied when the next weekday actually is
tomorrow, not just the first weekday reached after skipping a weekend).

**No production bootstrap** — every API request depends on a `Business`
record existing (`withBusiness` middleware). The only script that created
one, `seed.ts`, also seeded 50 fake leads, fake users, fake appointments, and
270 fake analytics events — not appropriate to run against a real production
database. Added `src/database/bootstrap.ts` (`npm run db:bootstrap`): creates
only the real Business record, idempotently, safe to run once in production.

**No email notifications** — `email.service.ts` was a stub that did nothing
in production; new leads/bookings would silently sit in MongoDB with zero
notification. Implemented a real Resend integration (gated behind
`RESEND_API_KEY`, degrades to a logged warning if unset — never blocks the
actual booking/contact-request from succeeding). Wired into both the booking
and contact-request creation paths, emailing `NOTIFY_EMAIL_TO`.

**Missing image assets** — `index.html` and `site.webmanifest` referenced
`favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`,
`android-chrome-192x192.png`, `android-chrome-512x512.png`, and
`og-image.png` — none of which existed in `public/`. Social share previews
(Slack, Twitter, LinkedIn, iMessage) showed broken images; PWA/home-screen
icons were broken. Generated all sizes from the existing brand SVG via
cairosvg, and a genuinely on-brand 1200×630 OG image matching the site's
actual hero copy and color palette. Also added `sitemap.xml` (referenced by
`robots.txt` but didn't exist).

## Files changed

| File | Change |
|---|---|
| `src/components/contact/BookingForm.tsx` | Real API call + error state instead of `mockSubmit` |
| `src/lib/apiClient.ts` | Added `createContactRequest`; removed `getBookings` |
| `src/components/portfolio/projectData.ts` | Removed fabricated case-study numbers |
| `src/server/services/booking.service.ts` | Rewritten — persists Lead + Appointment, sends notification |
| `src/server/routes/booking.routes.ts` | Added `withBusiness`; removed public GET |
| `src/components/InteractiveDashboard.tsx` | `newBooking` prop instead of polling public endpoint |
| `src/components/BookingModal.tsx` | Dynamic weekday dates; passes created booking to `onSuccess` |
| `src/App.tsx` | Tracks `latestBooking` in state instead of a numeric refresh trigger |
| `src/server/services/contact-request.service.ts` | Sends notification email on create |
| `src/server/services/email.service.ts` | Real Resend integration + booking/contact-request notification helpers |
| `src/server/config.ts` | Added `resendApiKey`, `notifyEmailTo`, `notifyEmailFrom` |
| `src/database/bootstrap.ts` | **New** — minimal production Business-record bootstrap |
| `package.json` | Added `db:bootstrap` script |
| `.env.example`, `render.yaml` | Documented new email env vars |
| `public/favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `og-image.png`, `sitemap.xml` | **New** — generated assets |

## Before you deploy

1. **Create a Resend account** (resend.com) and set `RESEND_API_KEY` — without
   it, bookings/contact requests still save correctly, but nobody gets notified.
   `NOTIFY_EMAIL_FROM` must be a domain verified in Resend.
2. **Run `npm run db:bootstrap` once** against your production `MONGODB_URI`
   before the site goes live — without it, every API call 500s with "No active
   business found."
3. **Do not run `npm run db:seed` against production** — it wipes and reseeds
   with fake data. It's fine for local dev only.
4. **Legal pages** — the footer claims "GDPR Compliant" and "SOC2
   Infrastructure" with no Privacy Policy or Terms page anywhere on the site.
   Not addressed in this pass — needs your review before publishing, ideally
   with a lawyer, since these are affirmative legal claims.
