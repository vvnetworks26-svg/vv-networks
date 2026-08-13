# VV Networks — Session 2 Fixes

On top of CLEANUP_NOTES.md (billing/CRM removal) and LAUNCH_READINESS_NOTES.md
(contact form, PII leak, booking persistence, etc). Verified clean:
`npx tsc --noEmit` → 0 errors, `npm run build` → client (Vite) and server
(esbuild) both build successfully, both before and after this session's changes.

## Task 1 — Domain consistency pass

Replaced all `vvnetworks.io` references with `vvnetworks.co.in`.

| File | Change |
|---|---|
| `index.html` | canonical link, og:url, og:image, twitter:image, JSON-LD `url`/`logo` |
| `public/sitemap.xml` | all 7 `<loc>` entries |
| `public/robots.txt` | Sitemap directive |
| `src/server/config.ts` | `notifyEmailFrom` default |
| `src/database/bootstrap.ts` | `website` field |
| `src/database/seed.ts` | `website` field, 3 seeded user emails |
| `render.yaml` | `NOTIFY_EMAIL_FROM` comment |
| `.env.example` | `NOTIFY_EMAIL_FROM` default — **not** on the task's known-locations list (wrong file extension for the suggested grep), found via a broader search |

Final `grep -rl "vvnetworks\.io" .` (excluding node_modules/dist): zero matches.

## Task 2 — Role self-escalation gap on PATCH /api/v1/users/:id

**Scope note:** this route had no authentication at all before this change —
not just a missing ownership check. `v1.ts` only ran `withBusiness`
(resolves the first active business by DB lookup, not by token), and
`authenticate` was never applied to any `/api/v1/*` route except `/auth/*`.
This contradicts the assumption that the "unauthenticated internal CRM API"
issue was fully closed in a prior session — it was likely closed for a
different endpoint; the rest of `/api/v1/*` (leads, conversations,
appointments, users list/get/create/delete, etc.) is still open. Out of
scope for this session per your instructions — flagging here, not fixing.

Changes, scoped to `PATCH /api/v1/users/:id` only:

| File | Change |
|---|---|
| `src/server/api/routes/v1.ts` | Added `authenticate` middleware to this one route (required — `updateUser` needs `req.user` to identify the caller) |
| `src/server/api/controllers/users.controller.ts` | If `req.body` contains `role`: reject with 403 if caller is changing their own record (even owner/admin); reject with 403 if caller isn't owner/admin. Non-role fields unaffected. |
| `src/server/api/response.ts` | Added `forbidden()` helper (403, matches existing `ok`/`notFound`/`badRequest` style) |

`PATCH /api/v1/profile` (self-service name/avatar edits) untouched.

## Task 3 — First-owner bootstrap path

| File | Change |
|---|---|
| `src/database/bootstrap-owner.ts` | **New.** Reads `OWNER_EMAIL`/`OWNER_NAME`/`OWNER_PASSWORD` from env, requires the Business record from `bootstrap.ts` to already exist, idempotent (exits 0 if the email already exists), hashes via `password.service.ts`'s `hashPassword` (same path `auth.service.ts` uses) |
| `package.json` | Added `user:bootstrap` script |
| `.env.example` | Documented `OWNER_EMAIL`/`OWNER_NAME`/`OWNER_PASSWORD` |

## Task 5 (added mid-session, user-approved) — Self-registration role escalation

Not one of the original 4 tasks. While implementing Task 3, found that
`POST /api/v1/auth/register` still accepted a client-supplied `role` field
(including `"owner"`) and passed it straight through — self-registration
was **not** actually locked to `"viewer"` as assumed. Confirmed with you
before fixing, since it was outside the declared scope.

| File | Change |
|---|---|
| `src/server/api/controllers/auth.controller.ts` | Removed `role` from `registerSchema` entirely — no longer accepted from the client |
| `src/server/services/auth.service.ts` | Removed `role` from `RegisterInput`; `register()` now hardcodes `role: "viewer"` |

## Task 4 — Centralize the contact email

Found more occurrences than the task's known-locations list (`ErrorBoundary.tsx`,
`BookingForm.tsx`, `contactData.ts` weren't listed). Centralized all runtime
React source through one constant, per the task's stated goal ("one-line
change, not a multi-file find-and-replace").

| File | Change |
|---|---|
| `src/lib/contact.ts` | **New.** Exports `CONTACT_EMAIL` |
| `src/App.tsx` | Footer mailto link now uses `CONTACT_EMAIL` |
| `src/components/ErrorBoundary.tsx` | Fallback UI mailto link now uses `CONTACT_EMAIL` |
| `src/components/contact/BookingForm.tsx` | Error-state message now uses `CONTACT_EMAIL` |
| `src/components/contact/contactData.ts` | `contactOptions` email entry now uses `CONTACT_EMAIL` |
| `src/server/config.ts` | **Unchanged** — already reads `NOTIFY_EMAIL_TO` env var with this as fallback default, confirmed correct as-is per task instructions |

Left as literal text (by design, not oversight):
- `index.html` JSON-LD — static HTML, no build-time templating in place
- `render.yaml` — deploy config default
- `README.md` — no occurrence found (already clean)
- `src/database/seed.ts`, `src/database/bootstrap.ts` — one-time setup
  scripts already documented as "update these values before running"

## Verification

- `npx tsc --noEmit` → 0 errors
- `npm run build` → client (Vite) and server (esbuild) both build successfully
- Traced `BookingForm.tsx` → `apiClient.createContactRequest()` →
  `POST /api/v1/contact-requests`: this route was not touched by Task 2 (only
  `PATCH /users/:id` got `authenticate`), and `apiClient.ts`'s base `request()`
  helper doesn't attach any Authorization header — the public contact form
  still works without a token.

## Task 6 — Router-level auth gate for /api/v1

Closes the gap noted at the end of the previous pass: everything under
`/api/v1` except `PATCH /users/:id` had no authentication, only `withBusiness`
(resolves business context from the DB, not from any token).

**Pre-change verification, as required:**
- `grep -n "authenticate\|withBusiness" src/server/app.ts src/server/api/routes/v1.ts`
  showed `withBusiness` applied router-wide (`v1.use(withBusiness)`) and
  `authenticate` used on exactly one route (`PATCH /users/:id`, from Task 2).
  `app.ts` had no matches for either.
- `git log --oneline -- src/server/app.ts`: this directory has no `.git` at
  all (`git rev-parse --is-inside-work-tree` → "not a git repository"), so
  there is no history to check. Can't distinguish "regression" from "never
  existed" — it's a working-tree snapshot, consistent with what
  CLEANUP_NOTES.md already said.
- No duplicate `POST /contact-requests` registration existed — one definition
  only, so no consolidation was needed.

**Changes**, all in `src/server/api/routes/v1.ts`:
- `POST /contact-requests` now takes `withBusiness` directly on the route
  (needs `getBid()` in the controller) and is registered before the auth gate,
  so it stays public.
- `v1.use(authenticate)` added immediately after that route, before
  `v1.use(withBusiness)` and every other route — business, users, leads,
  conversations, appointments, services, analytics, GET/PATCH/DELETE
  contact-requests, widget-sessions, and the mounted operations router.
- Router-wide `withBusiness` moved to run *after* `authenticate` (was
  before). This wasn't asked for explicitly but was necessary: with
  `withBusiness` first, every request — including ones with no token —
  would hit MongoDB before the 401 check could even run, which is both a
  minor DoS/probing surface and made local verification depend on a live DB
  for routes that should reject on the token check alone. `authenticate` has
  no DB dependency (`jwt.verify` only), so unauthenticated calls now get
  rejected without ever touching Mongo.
- `PATCH /users/:id`'s own inline `authenticate` (Task 2) left untouched —
  redundant now but harmless, and out of scope for this change.

**Verification — ran against a real MongoDB** (in-memory `mongodb-memory-server`,
installed with `--no-save` and fully removed afterward — `npm uninstall
mongodb-memory-server`, temp files deleted, confirmed no trace in
`package.json`/`package-lock.json`/`node_modules` afterward — the server
requires a working DB connection just to boot, so this was unavoidable to
actually prove the behavior rather than infer it):

No Authorization header, all return 401:
```
GET /business           → HTTP 401
GET /users               → HTTP 401
GET /leads               → HTTP 401
GET /conversations       → HTTP 401
GET /appointments        → HTTP 401
GET /services             → HTTP 401
GET /analytics            → HTTP 401
GET /contact-requests     → HTTP 401
GET /widget-sessions      → HTTP 401
```
Body (representative): `{"success":false,"error":"Authentication required","code":"UNAUTHENTICATED"}`

`POST /contact-requests`, no Authorization header, valid body — still succeeds:
```
HTTP 201
{"success":true,"data":{"businessId":"6a7c9112018c8d7a83eff039","name":"Jamie Rivera",
"email":"jamie@example.com","projectType":"website","message":"Interested in a website
rebuild, can we chat sometime this week?","preferredContact":"email",
"wantsLeadFlowDemo":false,"status":"new","_id":"6a7c912ece1f44d56664f689",
"createdAt":"2026-08-12T15:28:46.257Z", ...}}
```

Sanity check (not required, ran anyway): registered a user, confirmed the
token comes back with `"role":"viewer"` (Task 5 still correct), then called
`GET /leads` with that token — `HTTP 200`, confirming the gate isn't a
blanket deny.

`npx tsc --noEmit` → 0 errors, `npm run build` → clean, both before starting
this task and after finishing it.

## Not addressed, worth your attention

- The `authorize()` role-based helper (`owner`/`admin`/etc.) still isn't used
  anywhere except inline in `users.controller.ts`'s role-change check
  (Task 2). Every authenticated route currently accepts any role — a
  `viewer` can hit `DELETE /leads/:id` or `DELETE /appointments/:id` with a
  valid token. Whether that's correct depends on what "viewer" is supposed
  to mean in this system; flagging it since it wasn't in scope for either
  session.
