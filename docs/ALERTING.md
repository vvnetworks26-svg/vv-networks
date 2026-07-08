# Alerting — VV Networks

## Overview

The `AlertService` evaluates threshold-based rules and dispatches to configured channels.
It is fire-and-forget — alert failures never surface to end users.

---

## Alert rules

| Trigger | Severity | Threshold | Cooldown |
|---|---|---|---|
| `db.disconnected` | critical | `connected === false` | 60s |
| `memory.high` | warning | heap > 400MB | 5min |
| `memory.critical` | critical | heap > 600MB | 60s |
| `event_loop.lag` | warning | lag > 100ms | 2min |
| `auth.failures.spike` | warning | >20 failures/min | 5min |
| `payments.failures.spike` | critical | failure rate >30% | 10min |
| `error.rate.spike` | critical | error rate >10% | 5min |

---

## Channels

| Channel | Status | Activation |
|---|---|---|
| `console` | Always active | Logs at matching level (warn/error/fatal) |
| `email` | Stub | Wire `email.service.ts` when Resend/SES is ready |
| `slack` | Active if env set | Set `SLACK_WEBHOOK_URL` |
| `webhook` | Active if env set | Set `ALERT_WEBHOOK_URL` |

### Slack payload example

```json
{
  "text": "[CRITICAL] High memory usage",
  "attachments": [{
    "color": "#FF6600",
    "fields": [{ "title": "heapUsedMB", "value": "620", "short": true }]
  }]
}
```

---

## Auto-check

The dashboard endpoint (`GET /api/v1/operations/dashboard`) calls `alertService.autoCheck()` on every request, passing current system metrics. This means alerts fire automatically when the dashboard is polled.

For production, poll the dashboard every 60 seconds from your monitoring system.

---

## Manual alerts

```typescript
import alertService from "./server/services/alert.service.js";

// Fire a threshold-based rule
await alertService.fire("auth.failures.spike", { count: 35 });

// Fire a custom ad-hoc alert
await alertService.custom({
  title:    "Manual intervention required",
  message:  "Subscription renewal job has been failing for 2 hours",
  severity: "critical",
  channels: ["console", "slack"],
});
```

---

## Alert history

```
GET /api/v1/operations/errors   — includes last 20 alerts in response
GET /api/v1/operations/dashboard — includes last 5 alerts
```

`alertService.getHistory(50)` returns most recent first.

---

## Adding a new rule

In `alert.service.ts`, add to the `rules` array:

```typescript
{
  trigger:    "my.custom.trigger",
  title:      "My Custom Alert",
  severity:   "warning",
  cooldownMs: 300_000,
  channels:   ["console", "slack"],
  check: (data) => {
    const value = data["myValue"] as number;
    return value > 100 ? `My value is ${value} (threshold: 100)` : null;
  },
}
```

Fire it:

```typescript
await alertService.fire("my.custom.trigger", { myValue: 150 });
```

---

## Environment variables

| Variable | Description |
|---|---|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |
| `ALERT_WEBHOOK_URL` | Generic webhook for alert payloads |
| `SENTRY_DSN` | Sentry DSN (when Sentry provider is wired) |
