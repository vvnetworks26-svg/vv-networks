# Observability — VV Networks

## Architecture

```
Request → requestLogger → MetricsService (counters/histograms)
                        → PerformanceService (per-endpoint p95/p99)

Service calls          → MetricsService (business event counters)

Errors                 → ErrorTrackingService (dedup, ConsoleProvider / SentryProvider stub)

Background jobs        → SchedulerService → MetricsService

All above              → AlertService (threshold-based alerts)
                        → OperationalDashboard (GET /operations/dashboard)
```

---

## MetricsService

In-process, zero-dependency metrics. Counters, gauges, histograms.

### Key metrics tracked

| Metric | Type | Description |
|---|---|---|
| `http.requests.total` | counter | All API requests |
| `http.requests.errors` | counter | 5xx responses |
| `http.4xx.total` | counter | 4xx responses |
| `http.5xx.total` | counter | 5xx responses |
| `http.duration.ms` | histogram | Response time distribution |
| `http.slow_requests.total` | counter | Requests > 1000ms |
| `auth.logins.total` | counter | Successful logins |
| `auth.failures.total` | counter | Failed login attempts |
| `auth.registers.total` | counter | New user registrations |
| `leads.created.total` | counter | Leads created |
| `conversations.started.total` | counter | Conversations started |
| `appointments.booked.total` | counter | Appointments booked |
| `invoices.created.total` | counter | Invoices created |
| `invoices.paid.total` | counter | Invoices marked paid |
| `payments.recorded.total` | counter | Payments succeeded |
| `payments.failed.total` | counter | Payment failures |
| `subscriptions.created.total` | counter | Subscriptions created |
| `revenue.collected.cents` | counter | Total revenue in cents |
| `widget.sessions.total` | counter | Widget sessions started |
| `webhooks.events.total` | counter | Stripe webhooks received |
| `webhooks.errors.total` | counter | Webhook processing errors |
| `jobs.executed.total` | counter | Background jobs succeeded |
| `jobs.failed.total` | counter | Background jobs failed |
| `sessions.active` | gauge | Currently active sessions |

### API

```
GET /api/v1/operations/metrics   — raw snapshot of all counters/gauges/histograms
```

---

## PerformanceService

Tracks per-endpoint latency using a sliding window of the last 500 observations per route.

Computes: `avg`, `min`, `max`, `p95`, `p99`, `errorRate`, `count`.

```
GET /api/v1/operations/performance
```

Returns:
- `summary` — aggregate across all endpoints
- `slowest` — top 10 by p95 latency
- `mostFrequent` — top 10 by request count
- `highErrorRate` — endpoints with >5% error rate (min 10 requests)

---

## ErrorTrackingService

Deduplicates errors by message fingerprint. Keeps last 100 unique errors in memory.

### Providers

| Provider | Status | Activation |
|---|---|---|
| `ConsoleProvider` | Active | Always on |
| `SentryProvider` | Stub | Set `SENTRY_DSN` when Sentry package is added |

### Usage

```typescript
import errorTracker from "./server/services/error-tracking.service.js";

errorTracker.capture(err, { userId, businessId, resource: "payment" });
errorTracker.captureMessage("Webhook retry exceeded", "warning");
```

```
GET /api/v1/operations/errors   — recent errors + top errors + alerts
```

---

## Correlation IDs

Every HTTP request gets a UUID correlation ID:
- Attached to `req.correlationId`
- Returned in `X-Correlation-Id` response header
- Passed to child loggers for all log lines in that request
- Pass `X-Correlation-Id: <id>` in requests to trace across services

---

## Structured Logs

Production log format (JSON):

```json
{
  "level": "info",
  "message": "← response",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "service": "vv-networks",
  "env": "production",
  "correlationId": "uuid-here",
  "method": "POST",
  "url": "/api/v1/payments",
  "status": 201,
  "duration": 84
}
```

Development format: coloured pretty-print with `[correlationId]` prefix.
