# Maintenance Mode — VV Networks

## Overview

Maintenance mode can be enabled globally or per-business.
When active, all API endpoints return `503 Service Unavailable` except monitoring and operations paths.

---

## Enabling maintenance mode

### Via API

```bash
curl -X PATCH /api/v1/operations/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "message": "We are upgrading our infrastructure. Back in 30 minutes.",
    "estimatedCompletion": "2026-01-01T02:00:00Z"
  }'
```

### Disabling

```bash
curl -X PATCH /api/v1/operations/status \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled": false}'
```

---

## Whitelist

IPs and user IDs in the whitelist bypass maintenance mode:

```typescript
maintenanceService.addToWhitelist("203.0.113.1");   // IP
maintenanceService.addToWhitelist("usr_admin_123"); // userId
```

Via API, include `whitelist` in the PATCH body:

```json
{ "enabled": true, "whitelist": ["203.0.113.1", "usr_admin_123"] }
```

---

## Per-business override

```typescript
maintenanceService.setBusinessOverride("biz_123", false); // exclude this business
maintenanceService.setBusinessOverride("biz_456", true);  // force maintenance for this business
```

---

## Response when blocked

```json
{
  "success": false,
  "error": "Service temporarily unavailable",
  "code": "MAINTENANCE_MODE",
  "message": "We are upgrading our infrastructure. Back in 30 minutes.",
  "estimatedCompletion": "2026-01-01T02:00:00Z"
}
```

HTTP status: `503`

---

## Always-allowed paths

These paths always respond normally regardless of maintenance mode:

- `GET /api/health`
- `GET /api/ready`
- `GET /api/live`
- `GET /api/metrics`
- `GET /api/operations/status`
- `GET /api/operations/features`
- All `/api/operations/*` paths

---

## Status object

```json
{
  "enabled": true,
  "message": "...",
  "estimatedCompletion": "2026-01-01T02:00:00Z",
  "startedAt": "2026-01-01T01:30:00Z",
  "updatedAt": "2026-01-01T01:30:00Z",
  "businessOverrides": {},
  "whitelist": [],
  "activeCount": 142
}
```

`activeCount` tracks how many requests have been blocked since maintenance was enabled.
