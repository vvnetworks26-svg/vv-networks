# Environment Variables — VV Networks

Full reference for all environment variables.
Copy `.env.example` to `.env` for local development.

---

## Core

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | always | `development` | `development` \| `staging` \| `production` |
| `PORT` | optional | `3000` | HTTP server port |
| `APP_NAME` | optional | `vv-networks` | Service identifier in logs |
| `APP_VERSION` | optional | `0.0.0` | Semantic version, injected by CI |
| `APP_URL` | production | — | Public URL, e.g. `https://vv-networks-api.onrender.com` |
| `GIT_COMMIT` | optional | `local` | Git SHA, injected by CI |

---

## Database

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | production | MongoDB Atlas connection string |

Format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

---

## Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | production | dev placeholder | 64-char random hex. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_ACCESS_EXPIRY` | optional | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | optional | `30d` | Refresh token TTL |
| `BCRYPT_ROUNDS` | optional | `12` | bcrypt work factor (8–14 recommended) |

---

## CORS

| Variable | Required | Default | Description |
|---|---|---|---|
| `CORS_ORIGIN` | production | `*` | Allowed origin(s). Must NOT be `*` in production. Comma-separated for multiple. |

---

## Stripe

| Variable | Required | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | optional | `sk_live_...` or `sk_test_...` from Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | optional | `whsec_...` from Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | `pk_live_...` for frontend Stripe.js |

---

## AI

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | optional | Google Gemini API key for LeadFlow chat |

---

## Logging

| Variable | Default (dev) | Default (prod) | Description |
|---|---|---|---|
| `LOG_LEVEL` | `debug` | `info` | `debug` \| `info` \| `warn` \| `error` \| `fatal` |
| `LOG_FORMAT` | `pretty` | `json` | `pretty` (coloured text) \| `json` (structured) |

---

## Security & Performance

| Variable | Default | Description |
|---|---|---|
| `TRUST_PROXY` | `false` | Set `true` behind Render/Vercel load balancers |
| `COMPRESSION_ENABLED` | `false` | Enable gzip compression (`true` in production) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in ms |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |

---

## Monitoring

| Variable | Default | Description |
|---|---|---|
| `METRICS_ENABLED` | `true` | Enable `/api/metrics` endpoint |

---

## Startup validation

The application validates all environment variables on startup.

- **Production/Staging**: missing required variables cause immediate `process.exit(1)` with a clear error message.
- **Development**: missing variables print warnings but never block startup.
