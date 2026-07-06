# VV Networks — Official Website

Premium AI software studio website with integrated LeadFlow AI lead qualification system.

---

## Architecture

```
┌─────────────────────────────────┐     ┌───────────────────────────────────┐
│   Frontend (Vercel)             │     │   Backend API (Render)            │
│                                 │     │                                   │
│   React + TypeScript + Vite     │────▶│   Express + Node.js               │
│   Tailwind CSS + Framer Motion  │     │                                   │
│   src/lib/apiClient.ts          │     │   src/server/                     │
│                                 │     │   ├── app.ts          (Express)   │
│   VITE_API_URL=<Render URL>     │     │   ├── config.ts       (Env vars)  │
│                                 │     │   ├── routes/                     │
│   Deployed from: /              │     │   │   ├── health.routes.ts        │
│   Build: vite build             │     │   │   ├── leadflow.routes.ts      │
│   Output: dist/                 │     │   │   └── booking.routes.ts       │
└─────────────────────────────────┘     │   └── services/                  │
                                        │       ├── gemini.service.ts       │
                                        │       └── booking.service.ts      │
                                        │                                   │
                                        │   Build: esbuild → dist/server.cjs│
                                        │   Start: node dist/server.cjs     │
                                        └───────────────────┬───────────────┘
                                                            │
                                                            ▼
                                                   ┌────────────────┐
                                                   │   Google Gemini │
                                                   │   (AI Chat)    │
                                                   └────────────────┘
```

**One backend. One Gemini integration. One source of truth.**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service health + Gemini status |
| `POST` | `/api/leadflow/chat` | AI chat — `{ message, history[] }` → `{ text, fallback }` |
| `POST` | `/api/bookings` | Create booking — `{ name, email, company?, date?, time?, notes? }` |
| `GET` | `/api/bookings` | List all bookings (in-memory, session-scoped) |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your Gemini API key
cp .env.example .env
# Edit .env: set GEMINI_API_KEY

# 3. Start dev server (Express + Vite HMR on same port)
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

### Backend (`Render` / local `.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI API key — [get one here](https://aistudio.google.com/app/apikey) |
| `PORT` | No | Server port (default: `3000`) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: `*`, set to Vercel URL in production) |
| `NODE_ENV` | No | `development` or `production` |

### Frontend (`Vercel` environment settings)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Full URL of the Render backend, e.g. `https://vv-networks-api.onrender.com` |

> **Development:** Leave `VITE_API_URL` empty — the Vite dev server and Express run on the same port, so `/api/*` routes resolve automatically.

---

## Deployment

### Backend → Render

1. Push repo to GitHub
2. New Web Service on [render.com](https://render.com)
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install && npm run build:server`
   - **Start Command:** `npm start`
   - **Environment:** Add `GEMINI_API_KEY` and `CORS_ORIGIN` in the Render dashboard
5. Copy the service URL (e.g. `https://vv-networks-api.onrender.com`)

### Frontend → Vercel

1. New Project on [vercel.com](https://vercel.com)
2. Connect the same GitHub repo
3. Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build:client`
   - **Output Directory:** `dist`
4. Environment Variables:
   - `VITE_API_URL` = your Render service URL
5. Deploy

---

## Build Scripts

```bash
npm run dev           # Dev server (Express + Vite HMR)
npm run build         # Build frontend + backend
npm run build:client  # Frontend only (Vite → dist/)
npm run build:server  # Backend only (esbuild → dist/server.cjs)
npm start             # Run production server
npm run lint          # TypeScript type check
```

---

## Project Structure

```
/
├── server.ts                    # Entry point — Express app + Vite/static serving
├── src/
│   ├── server/                  # Backend modules
│   │   ├── app.ts               # Express app factory (routes + middleware)
│   │   ├── config.ts            # Env var config object
│   │   ├── routes/              # Route handlers (thin — no business logic)
│   │   │   ├── health.routes.ts
│   │   │   ├── leadflow.routes.ts
│   │   │   └── booking.routes.ts
│   │   └── services/            # Business logic
│   │       ├── gemini.service.ts   # Single Gemini integration
│   │       └── booking.service.ts  # Booking CRUD (in-memory → MongoDB-ready)
│   ├── lib/
│   │   └── apiClient.ts         # Centralised frontend API client
│   ├── components/              # React UI components
│   ├── vite-env.d.ts            # Vite env type declarations
│   └── App.tsx                  # Root component
├── vercel.json                  # Vercel frontend config
├── render.yaml                  # Render backend config
├── .env.example                 # Environment variable template
└── package.json
```

---

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React  
**Backend:** Node.js, Express, Google Gemini AI (`@google/genai`)  
**Deployment:** Vercel (frontend), Render (backend)  
**Future:** MongoDB Atlas (replace in-memory booking store)
