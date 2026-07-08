# Feature Flags — VV Networks

## Overview

In-process feature flag system. No external dependency.
Future-ready for LaunchDarkly / Flagsmith via provider swap.

---

## Built-in flags

| Key | Default | Description |
|---|---|---|
| `billing.stripe` | `false` | Enable live Stripe payment processing |
| `billing.subscriptions` | `true` | Enable subscription creation via API |
| `leadflow.widget` | `true` | Enable LeadFlow chat widget |
| `leadflow.ai_chat` | `true` | Enable Gemini AI in widget |
| `maintenance.enabled` | `false` | Global maintenance mode toggle |
| `analytics.dashboard` | `true` | Enable operational analytics dashboard |
| `jobs.cleanup` | `true` | Enable background cleanup jobs |
| `jobs.invoice_reminders` | `false` (prod: `true`) | Automated invoice reminders |
| `operations.audit_dashboard` | `true` | Enable audit log dashboard API |

---

## Evaluation priority (highest → lowest)

1. User override (`userOverrides[userId]`)
2. Business override (`businessOverrides[businessId]`)
3. Environment override (`envOverrides[nodeEnv]`)
4. Percentage rollout (deterministic hash of `key:userId`)
5. `defaultValue`

---

## API

```
GET  /api/v1/operations/features          — list all flags
PATCH /api/v1/operations/features/:key    — update a flag
```

### PATCH body

```json
{
  "defaultValue": true,
  "rolloutPct": 50,
  "businessOverrides": { "biz_123": false },
  "userOverrides":     { "usr_456": true },
  "envOverrides":      { "production": false }
}
```

---

## Code usage

```typescript
import featureFlagService from "./server/services/feature-flags.service.js";

// Simple boolean check
if (featureFlagService.isEnabled("billing.stripe")) {
  // use Stripe
}

// With context (user/business-specific)
if (featureFlagService.evaluate("billing.stripe", { businessId, userId })) {
  // enabled for this specific business/user
}

// Toggle globally
featureFlagService.toggle("jobs.cleanup", false);

// Create a new flag
featureFlagService.upsert("new.feature", {
  description:  "My new feature",
  defaultValue: false,
  rolloutPct:   10,   // enable for 10% of users
});
```

---

## Percentage rollout

Uses a deterministic MD5 hash of `flagKey:userId` to assign users to buckets 1–100.
The same user always gets the same result for the same flag.
Different flags produce independent bucketing.

---

## Future: Remote providers

To add a remote provider (LaunchDarkly, Flagsmith):

1. Implement the evaluation logic in `feature-flags.service.ts`
2. Add a provider check at the top of `evaluate()`:
   ```typescript
   if (this.remoteProvider) return this.remoteProvider.evaluate(key, ctx);
   ```
3. Flags fall back to local definitions if the remote provider is unavailable.
