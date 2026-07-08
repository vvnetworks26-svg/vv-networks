# Operations Runbook — VV Networks

## Quick Reference

| Action | Command / URL |
|---|---|
| Start dev server | `npm run dev` |
| TypeScript check | `npm run lint` |
| Production build | `npm run build` |
| Seed database | `npm run db:seed` |
| Health check | `GET /api/health` |
| Readiness | `GET /api/ready` |
| Metrics | `GET /api/metrics` |
| Stripe webhooks | `POST /api/webhooks/stripe` |

---

## Local Development

```bash
# 1. Clone and install
git clone <repo>
cd vv-networks
npm install

# 2. Configure environment
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, STRIPE keys

# 3. Start
npm run dev
# → http://localhost:3000

# 4. Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Deployment

See `docs/DEPLOYMENT.md` for full deployment guide.

**TL;DR:**
- Frontend → Vercel (auto on push to `main`)
- Backend → Render (triggered by CI webhook)
- Database → MongoDB Atlas

---

## Common Operations

### Force index sync

Indexes are synced automatically on startup. If you need to force:

```bash
# Connect to production server via Render shell
node -e "
import('./src/database/index.js').then(m => m.ensureIndexes()).then(() => process.exit(0));
"
```

### Check environment health

```bash
curl https://vv-networks-api.onrender.com/api/health | jq .
curl https://vv-networks-api.onrender.com/api/metrics | jq .
```

### View structured logs

Render dashboard → Service → Logs (JSON format in production)

Filter by correlation ID:
```bash
# Render logs support text filtering
# Search for: "correlationId":"abc12345"
```

### Manual payment refund

```bash
curl -X POST https://vv-networks-api.onrender.com/api/v1/payments/:id/refund \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Customer request"}'
```

### Cancel subscription immediately

```bash
curl -X POST https://vv-networks-api.onrender.com/api/v1/subscriptions/:id/cancel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"atPeriodEnd": false}'
```

---

## Incident Response

### Database connection failure

1. Check `/api/health` → `checks.database.status`
2. Verify `MONGODB_URI` in Render env vars
3. Check MongoDB Atlas cluster status at cloud.mongodb.net
4. Check Atlas Network Access includes Render's IP
5. Restart Render service if connection pool is stale

### High memory usage

1. Check `/api/metrics` → `memory.heapUsed`
2. Look for unbounded query results in recent logs
3. Render → Service → restart

### Stripe webhooks failing

1. Stripe dashboard → Developers → Webhooks → check delivery attempts
2. Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret
3. Check `/api/webhooks/stripe` is accessible from the internet (not behind auth)
4. Check logs for `[Webhook] Signature verification failed`

---

## CI/CD

See `.github/workflows/ci.yml`.

Pipeline runs on every push to `main`, `staging`, `develop`:

1. **TypeScript** — `tsc --noEmit`
2. **Security audit** — `npm audit --audit-level=high`
3. **Production build** — client + server bundle
4. **Bundle size check** — warns if server > 2MB
5. **Deploy** — triggers Render + Vercel hooks (main branch only)

Add these to GitHub repository variables:
- `RENDER_DEPLOY_HOOK` — from Render → Settings → Deploy Hooks
- `VERCEL_DEPLOY_HOOK` — from Vercel → Settings → Git → Deploy Hooks
- `APP_URL` — your production URL (for environment label)
