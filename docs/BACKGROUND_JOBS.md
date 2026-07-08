# Background Jobs — VV Networks

## Overview

Lightweight in-process scheduler. No cron daemon, no Redis, no external dependencies.
Jobs run in the same Node.js process on `setInterval` timers with `unref()` (won't block graceful shutdown).

---

## Registered jobs

| ID | Name | Interval | Description |
|---|---|---|---|
| `cleanup:expired-tokens` | Cleanup Expired Tokens | Hourly | Deletes expired refresh, reset, and email verification tokens from MongoDB |
| `cleanup:widget-sessions` | Cleanup Old Widget Sessions | Daily | Soft-deletes complete/idle widget sessions older than 30 days |
| `cleanup:audit-logs` | Audit Log Retention Check | Daily | Verifies MongoDB TTL index is running (auto-purge at 90 days) |
| `analytics:aggregation` | Analytics Aggregation | Hourly | Counts analytics events in the last hour, updates gauge |
| `billing:invoice-reminders` | Invoice Reminders | Daily | Queries overdue invoices (email integration pending) |
| `billing:subscription-check` | Subscription Renewal Check | Daily | Expires grace periods, cancels `cancelAtPeriodEnd` subscriptions |
| `ops:backup-reminder` | Backup Reminder | Daily | Logs a reminder to verify Atlas backups |

---

## Job lifecycle

```
register() → start() → [interval fires] → runJob()
                                         ├─ handler() succeeds → status: success
                                         └─ handler() throws   → retry (maxRetries)
                                                               └─ status: failed, errorTracker.capture()
```

---

## API

```
GET  /api/v1/operations/jobs         — all job records
POST /api/v1/operations/jobs/:id/run — manually trigger a job
```

### Job record

```json
{
  "id": "cleanup:expired-tokens",
  "name": "Cleanup Expired Tokens",
  "interval": "hourly",
  "intervalMs": 3600000,
  "enabled": true,
  "lastRunAt": "2026-01-01T01:00:00.000Z",
  "lastStatus": "success",
  "runCount": 24,
  "errorCount": 0,
  "avgDurationMs": 12,
  "nextRunAt": "2026-01-01T02:00:00.000Z"
}
```

---

## Adding a new job

In `scheduler.service.ts`, inside `registerJobs()`:

```typescript
schedulerService.register({
  id:          "my:job",
  name:        "My Custom Job",
  description: "Does something useful",
  interval:    "daily",      // minutely | hourly | daily | weekly
  maxRetries:  2,
  enabled:     true,
  handler: async () => {
    // job logic here — never access Mongoose models directly
    // import models dynamically to avoid circular deps
    const { Invoice } = await import("../../database/models/Invoice.js");
    const count = await Invoice.countDocuments({ status: "overdue" });
    logger.info("[Job] My job complete", { count });
  },
});
```

---

## Retry behaviour

- If `handler()` throws, it retries up to `maxRetries` times
- Each retry has a backoff: `1s × attempt`
- After exhausting retries, `lastStatus` is set to `"failed"` and `errorTracker.capture()` is called
- Failed jobs do not re-run until the next interval fires

---

## Graceful shutdown

`schedulerService.stop()` is called on `SIGTERM` / `SIGINT` in `server.ts`.
In-progress jobs finish naturally (they are async functions — not killed mid-flight).

---

## Metrics

| Metric | Description |
|---|---|
| `jobs.executed.total` | Total successful job runs |
| `jobs.failed.total` | Total failed job runs |
