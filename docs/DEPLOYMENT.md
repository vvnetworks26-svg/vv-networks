# Deployment Guide — VV Networks

## Architecture

```
┌─────────────────────────────────────────────┐
│              PRODUCTION STACK               │
├─────────────────┬───────────────────────────┤
│  Frontend       │  Vercel                   │
│  (React SPA)    │  → Vite build → dist/     │
├─────────────────┼───────────────────────────┤
│  Backend        │  Render (Starter plan)    │
│  (Express API)  │  → dist/server.cjs        │
├─────────────────┼───────────────────────────┤
│  Database       │  MongoDB Atlas (M10+)     │
│                 │  → Shared cluster → prod  │
├─────────────────┼───────────────────────────┤
│  Payments       │  Stripe                   │
│                 │  → webhooks → Render      │
└─────────────────┴───────────────────────────┘
```

---

## Frontend — Vercel

### First deploy

```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel
```

### Environment variables (Vercel dashboard)

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://vv-networks-api.onrender.com` |
| `VITE_APP_VERSION` | injected by CI (`${{ github.sha }}`) |

### Domain setup

1. Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update `CORS_ORIGIN` on Render to match

---

## Backend — Render

### First deploy

1. Connect GitHub repo in Render dashboard
2. Create **Web Service**
3. Use settings from `render.yaml` (Render reads this automatically)
4. Set all `sync: false` environment variables in the Render dashboard

### Build & Start commands

```
Build:  npm ci && npm run build:server
Start:  npm start
```

### Health check

Render uses `GET /api/ready` as the health check path (set in render.yaml).
Deployment only completes when this endpoint returns 200.

### Deploy via webhook (CI)

```
Settings → Deploy Hooks → Create hook → copy URL
```

Add to GitHub repository secrets as `RENDER_DEPLOY_HOOK`.

---

## Database — MongoDB Atlas

### Cluster setup

1. Create M10+ dedicated cluster (M0 free tier has connection limits)
2. **Network access** → Add IP `0.0.0.0/0` for Render (or whitelist Render's outbound IPs)
3. **Database access** → Create user with `readWrite` on your database
4. Copy connection string → set as `MONGODB_URI` in Render

### Connection string format

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/vv-networks?retryWrites=true&w=majority
```

### Indexes

Indexes are auto-created at startup via `ensureIndexes()`. No manual migration needed.

---

## Stripe

### Webhook setup

1. Stripe dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://vv-networks-api.onrender.com/api/webhooks/stripe`
3. Events to select:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy **Signing Secret** → set as `STRIPE_WEBHOOK_SECRET` in Render

---

## Staging environment

1. Create a second Render service `vv-networks-api-staging`
2. Point to `staging` branch
3. Use test Stripe keys (`sk_test_...`)
4. Use a separate MongoDB Atlas database (`vv-networks-staging`)

---

## Rollback

1. Render dashboard → Deploys → select previous successful deploy → **Redeploy**
2. Database: see `docs/BACKUPS.md`
