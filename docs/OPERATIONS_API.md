# Operations API — VV Networks

All endpoints are under `/api/v1/operations` and require the standard business context.

---

## Dashboard

### `GET /api/v1/operations/dashboard`

Full operational snapshot. Returns one payload with:

| Section | Contents |
|---|---|
| `build` | service name, version, env, git commit, uptime, Node.js version, PID |
| `system` | database status, memory (MB), event loop lag, CPU count, load avg |
| `api` | total requests, 4xx/5xx counts, avg/p95 latency, error rate, slow requests |
| `auth` | logins, failures, registers (since last restart) |
| `business` | leads, conversations, appointments, invoices, payments, revenue, widget sessions |
| `errors` | total errors, unique errors, top 5 errors, recent alerts |
| `jobs` | total jobs, running/failed counts, full job list |
| `webhooks` | total webhook events, errors, Stripe events |
| `maintenance` | current maintenance status |

Also triggers `alertService.autoCheck()` — fires alerts if thresholds exceeded.

---

### `GET /api/v1/operations/system`

Detailed system information: database, memory, CPU, OS, process.

### `GET /api/v1/operations/errors`

Error tracking: stats, recent unique errors, recent alerts.

### `GET /api/v1/operations/metrics`

Raw metrics snapshot: all counters, gauges, histograms.

### `GET /api/v1/operations/performance`

API performance breakdown:
- `summary` — aggregate p95, p99, error rate, slow request count
- `slowest` — top 10 endpoints by p95 latency
- `mostFrequent` — top 10 endpoints by request count
- `highErrorRate` — endpoints with >5% error rate

### `GET /api/v1/operations/activity`

Recent audit log entries for the current business.

Query params: `limit` (max 100)

---

## Background Jobs

### `GET /api/v1/operations/jobs`

All registered jobs with status, run count, error count, last run time, next run time, avg duration.

### `POST /api/v1/operations/jobs/:id/run`

Manually trigger a job by ID. Returns immediately — job runs async.

Job IDs:
- `cleanup:expired-tokens`
- `cleanup:widget-sessions`
- `cleanup:audit-logs`
- `analytics:aggregation`
- `billing:invoice-reminders`
- `billing:subscription-check`
- `ops:backup-reminder`

---

## Audit Logs

### `GET /api/v1/operations/audit`

Filterable audit log search.

Query params:
| Param | Description |
|---|---|
| `page`, `limit` | Pagination |
| `action` | Filter by action (e.g. `auth.login`) |
| `userId` | Filter by user ID |
| `resource` | Filter by resource type |
| `since`, `until` | ISO 8601 date range |

Returns entries + `actionStats` (action frequency breakdown).

### `GET /api/v1/operations/audit/users?userId=<id>`

Audit history for a specific user.

### `GET /api/v1/operations/audit/businesses?days=7`

Business-level audit summary: action stats + daily activity timeline.

---

## Maintenance Mode

### `GET /api/v1/operations/status`

Returns current maintenance status including message, estimated completion, whitelist, and blocked request count.

### `PATCH /api/v1/operations/status`

```json
// Enable
{ "enabled": true, "message": "Upgrade in progress", "estimatedCompletion": "2026-01-01T02:00:00Z" }

// Disable
{ "enabled": false }

// Update message only
{ "message": "Extended maintenance — back in 30 mins" }
```

When maintenance is active, all API requests return `503` with:
```json
{
  "success": false,
  "error": "Service temporarily unavailable",
  "code": "MAINTENANCE_MODE",
  "message": "...",
  "estimatedCompletion": "..."
}
```

Always-allowed paths (bypass maintenance):
`/api/health`, `/api/ready`, `/api/live`, `/api/metrics`, `/api/operations/*`

---

## Feature Flags

### `GET /api/v1/operations/features`

All feature flags with their definitions.

### `PATCH /api/v1/operations/features/:key`

Update any field of a flag. See `docs/FEATURE_FLAGS.md`.

---

## Alerts

### `POST /api/v1/operations/alerts/test`

Fire a test alert to verify channels are working.

```json
{ "severity": "warning", "title": "Test", "message": "Testing alert channels" }
```
