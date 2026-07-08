/**
 * Centralised API client for VV Networks frontend.
 *
 * Request routing by environment:
 *
 * Development (Vite dev server):
 *   VITE_API_URL is "" → BASE_URL is ""
 *   Browser sends: POST /api/leadflow/chat
 *   Vite proxy (vite.config.ts) forwards /api/* → Express on same process
 *   No CORS, no absolute URL needed.
 *
 * Production (Vercel frontend + Render backend):
 *   VITE_API_URL is "" (not needed — Vercel proxies the request)
 *   Browser sends: POST https://your-app.vercel.app/api/leadflow/chat
 *   vercel.json rewrite: /api/(.*) → https://vv-networks-api.onrender.com/api/$1
 *   Vercel proxies to Render server-side → no CORS issues.
 *
 * If VITE_API_URL is explicitly set (e.g. direct Render testing):
 *   BASE_URL = "https://vv-networks-api.onrender.com"
 *   Browser sends: POST https://vv-networks-api.onrender.com/api/leadflow/chat
 *   CORS_ORIGIN on Render must include the Vercel domain.
 */
import { env } from "./environment";

const BASE_URL = env.apiUrl;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${method} ${path} → ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<T>;
}

// ── Typed API surface ────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatResponse {
  text: string;
  fallback: boolean;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  company: string;
  date: string;
  time: string;
  notes: string;
  timestamp: string;
}

export interface CreateBookingPayload {
  name: string;
  email: string;
  company?: string;
  date?: string;
  time?: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  booking: Booking;
}

export interface HealthResponse {
  status: string;
  service: string;
  env: string;
  gemini: string;
  timestamp: string;
}

// ── Methods ──────────────────────────────────────────────────────────────────

export const api = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/api/health");
  },

  chat(message: string, history: ChatMessage[]): Promise<ChatResponse> {
    return request<ChatResponse>("/api/leadflow/chat", {
      method: "POST",
      body: { message, history },
    });
  },

  createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
    return request<BookingResponse>("/api/bookings", {
      method: "POST",
      body: payload,
    });
  },

  getBookings(): Promise<Booking[]> {
    return request<Booking[]>("/api/bookings");
  },
};
