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

## Uptime Alerting — why this exists

The August 2026 outage (backend unreachable, `x-render-routing: no-server` /
misrouted `vercel.json` rewrite) went undetected until a human happened to
notice the live site looked wrong. Nothing pages anyone when the backend is
unreachable today.

**Why this can't be fixed by finishing `alert.service.ts`:** that service's
rules (`db.disconnected`, `memory.high`, etc.) only fire from *inside* the
running Node process — via `autoCheck()`, presumably called from a periodic
job. If the process itself is down, crashed, or unreachable (exactly what
happened), there's nothing running to detect or send that alert. In-process
alerting is structurally incapable of catching "the whole service is
unreachable." Detecting that requires an outside observer — either Render's
own platform-level monitor, or a third-party service hitting the public URL.
Two options below, both requiring only dashboard clicks, no code:

### Option A — Render's built-in health-check notifications

Render can notify by **email or Slack** when a running service becomes
unhealthy, using this service's own `healthCheckPath: /api/ready`
(already configured in `render.yaml`). No new service or code needed.

**Steps** (from [Render's notifications docs](https://render.com/docs/notifications)):
1. In the Render Dashboard, go to your **workspace home → Integrations → Notifications** (left sidebar).
2. Choose a notification destination: **Email**, **Slack**, or both. For Slack, click **Connect Slack** first and authorize your workspace.
3. Set the notification level to **"Only failure notifications"** — this covers "a running service becomes unhealthy" (health check starts failing on a live service), not just deploy failures.
4. Optional: to override this for just the `vv-networks` service instead of the whole workspace, go to that service's **Settings → Notifications** and pick something other than "Use workspace default."

**What it catches:** the Render service itself crashing, running out of memory, or failing its own `/api/ready` health check.
**What it does NOT catch:** anything upstream of Render — DNS issues, Cloudflare, or (as in this incident) `vercel.json`'s rewrite pointing at the wrong hostname entirely. From Render's own perspective, a misrouted rewrite isn't "this service is unhealthy" — the service Render is watching may be perfectly healthy while traffic never reaches it.

### Option B — External uptime monitor (UptimeRobot free tier)

Hits `https://www.vvnetworks.co.in/api/health` from outside the whole stack —
DNS, Cloudflare, the Vercel rewrite, and the Render backend — the exact path
a real visitor takes. This is the check that would have caught *this specific*
incident, since the root cause was in the rewrite, not in Render itself.

**Steps** (from [UptimeRobot's setup guide](https://help.uptimerobot.com/en/articles/11358364-how-to-create-your-first-monitor-on-uptimerobot-quick-setup-guide)):
1. Sign up free at [uptimerobot.com](https://uptimerobot.com) — free plan: 50 monitors, 5-minute check interval, no credit card required.
2. Click **"+ Add New Monitor"**.
3. Monitor type: **HTTP(s)**.
4. URL: `https://www.vvnetworks.co.in/api/health`.
5. Friendly name: e.g. `VV Networks — API health`.
6. Alert contacts: add the email (and optionally Discord/Slack/Pushover — free-tier integrations) that should be notified on downtime; set notification delay to 0 or 1 check to avoid delaying on a single blip.
7. Monitoring interval: 5 minutes (free tier default — 1 minute requires a paid plan).
8. Click **Create monitor**.

Optionally add a second monitor for `https://vv-networks.onrender.com/api/health` (direct-to-Render, bypassing Vercel/Cloudflare) — if only the Vercel-facing one fails while the direct one passes, that immediately narrows the problem to the rewrite/CDN layer rather than the backend, which is exactly the ambiguity that slowed diagnosis in this incident.

### Recommendation

**Set up both — they check different things and neither takes more than a few minutes.** Render's notification (Option A) is one click and catches the backend actually crashing or failing its own health check. The external monitor (Option B) is the one that would have caught *this specific* incident, because it tests the full public path end-to-end, including the exact misconfiguration (a bad rewrite hostname) that Render-side monitoring has no visibility into. They're complementary, not redundant — enabling only Render's would have left this exact incident undetected again; enabling only UptimeRobot forgoes free, zero-setup crash detection you already have available.

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
