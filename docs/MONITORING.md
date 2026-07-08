# Monitoring — VV Networks

## Health Endpoints

All endpoints are unauthenticated and intended for infrastructure probes.

### `GET /api/health`

Full health check. Returns 200 (healthy) or 503 (degraded).

```json
{
  "status": "healthy",
  "service": "vv-networks",
  "version": "0.0.0",
  "env": "production",
  "commit": "abc1234",
  "uptime": 3600,
  "timestamp": "2026-01-01T00:00:00.000Z",
  "checks": {
    "database": { "status": "ok", "readyState": 1, "host": "cluster.mongodb.net" },
    "memory": { "rss": 80.5, "heapUsed": 45.2, "heapTotal": 70.0, "external": 2.1 },
    "eventLoopLagMs": 0.3
  }
}
```

### `GET /api/ready`

Kubernetes/Render readiness probe. Returns 200 when ready to accept traffic.

```json
{ "ready": true, "database": "connected" }
```

### `GET /api/live`

Kubernetes/Render liveness probe. Always 200 if the process is running.

```json
{ "alive": true, "pid": 1234, "uptime": 3600 }
```

### `GET /api/metrics`

Detailed system metrics. Returns 200 always.

```json
{
  "service": { "name": "vv-networks", "version": "...", "env": "production", "commit": "abc1234", "pid": 1, "uptime": 3600, "nodeVersion": "v20.x" },
  "database": { "connected": true, "readyState": 1, "host": "cluster.mongodb.net", "poolSize": 3 },
  "memory": { "rss": 80.5, "heapUsed": 45.2, "heapTotal": 70.0, "external": 2.1 },
  "cpu": { "user": 1234, "system": 234 },
  "system": { "platform": "linux", "arch": "x64", "cpus": 2, "loadAvg": [0.1, 0.2, 0.3], "totalMemMB": 512, "freeMemMB": 200 },
  "eventLoop": { "lagMs": 0.5 },
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## Render Configuration

- **Health check path**: `/api/ready`
- **Auto-restart**: enabled (Render restarts on non-zero exit)

---

## Alerts (recommended)

Set these up in Render or an external uptime monitor (BetterStack, UptimeRobot):

| Check | Condition | Action |
|---|---|---|
| `/api/ready` returns non-200 | > 1 minute | PagerDuty / Slack alert |
| Memory `heapUsed` > 400MB | sustained | Scale up / investigate leak |
| Event loop lag > 100ms | sustained | Investigate blocking operations |
| Database `connected: false` | any | Immediate alert |

---

## Structured Logging

All logs are emitted as JSON in production:

```json
{
  "level": "info",
  "message": "→ request",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "service": "vv-networks",
  "env": "production",
  "correlationId": "uuid-here",
  "method": "POST",
  "url": "/api/v1/payments",
  "ip": "1.2.3.4"
}
```

### Correlation IDs

Every request receives a `X-Correlation-Id` response header.
Pass `X-Correlation-Id: <id>` in requests to trace across services.

### Log levels

| Level | When used |
|---|---|
| `debug` | Detailed diagnostic info (development only) |
| `info` | Normal operations (requests, startup, DB connect) |
| `warn` | Non-critical issues (missing optional env vars, webhook skipped) |
| `error` | Request/handler errors, external service failures |
| `fatal` | Startup failures, unrecoverable errors |

---

## Sensitive Field Masking

The logger automatically redacts these fields from log output:
`password`, `passwordHash`, `token`, `secret`, `apiKey`, `authorization`, `cookie`, `jwt`, `accessToken`, `refreshToken`, `stripeSecretKey`, `mongoUri`, `creditCard`, `cardNumber`, `cvv`, `ssn`
