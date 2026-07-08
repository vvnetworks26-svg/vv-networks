/**
 * MetricsService — Phase I.7
 *
 * In-process metrics store. All counters and gauges live in memory.
 * No external dependency required — future-ready for Prometheus/DataDog export.
 *
 * Tracks:
 *  API requests, response times, status codes
 *  Database queries and latency
 *  Business events: leads, conversations, appointments, invoices, payments
 *  Auth events, widget usage, Stripe/webhook events
 *  System: memory, CPU, active sessions
 */

export type MetricType = "counter" | "gauge" | "histogram";

interface MetricEntry {
  type:       MetricType;
  value:      number;
  count:      number;
  sum:        number;
  min:        number;
  max:        number;
  lastValue:  number;
  updatedAt:  Date;
  labels:     Record<string, string>;
}

// ── Histogram bucket helper ───────────────────────────────────────────────────
interface HistogramData {
  count:  number;
  sum:    number;
  min:    number;
  max:    number;
  p50:    number;
  p95:    number;
  p99:    number;
  buckets:number[];   // raw observations (capped at 1000)
}

// ── Metric names (typed for safety) ──────────────────────────────────────────
export const METRIC = {
  // API
  HTTP_REQUESTS_TOTAL:   "http.requests.total",
  HTTP_REQUESTS_ERRORS:  "http.requests.errors",
  HTTP_DURATION_MS:      "http.duration.ms",
  HTTP_4XX_TOTAL:        "http.4xx.total",
  HTTP_5XX_TOTAL:        "http.5xx.total",

  // Auth
  AUTH_LOGINS:           "auth.logins.total",
  AUTH_FAILURES:         "auth.failures.total",
  AUTH_REGISTERS:        "auth.registers.total",
  AUTH_LOGOUTS:          "auth.logouts.total",
  AUTH_RESET_REQUESTS:   "auth.reset_requests.total",

  // Business events
  LEADS_CREATED:         "leads.created.total",
  CONVERSATIONS_STARTED: "conversations.started.total",
  APPOINTMENTS_BOOKED:   "appointments.booked.total",
  INVOICES_CREATED:      "invoices.created.total",
  INVOICES_PAID:         "invoices.paid.total",
  PAYMENTS_RECORDED:     "payments.recorded.total",
  PAYMENTS_FAILED:       "payments.failed.total",
  SUBSCRIPTIONS_CREATED: "subscriptions.created.total",
  SUBSCRIPTIONS_CANCELLED:"subscriptions.cancelled.total",
  QUOTES_CREATED:        "quotes.created.total",
  QUOTES_CONVERTED:      "quotes.converted.total",

  // Revenue
  REVENUE_COLLECTED_CENTS:"revenue.collected.cents",

  // Widget
  WIDGET_SESSIONS:       "widget.sessions.total",
  WIDGET_COMPLETIONS:    "widget.completions.total",

  // Database
  DB_QUERIES_TOTAL:      "db.queries.total",
  DB_QUERY_DURATION_MS:  "db.query.duration.ms",
  DB_ERRORS:             "db.errors.total",

  // Webhooks / Stripe
  WEBHOOK_EVENTS:        "webhooks.events.total",
  WEBHOOK_ERRORS:        "webhooks.errors.total",
  STRIPE_EVENTS:         "stripe.events.total",

  // Jobs
  JOBS_EXECUTED:         "jobs.executed.total",
  JOBS_FAILED:           "jobs.failed.total",

  // Active sessions (gauge)
  ACTIVE_SESSIONS:       "sessions.active",
} as const;

export type MetricName = typeof METRIC[keyof typeof METRIC];

// ── MetricsService ────────────────────────────────────────────────────────────

class MetricsService {
  private readonly counters  = new Map<string, number>();
  private readonly gauges    = new Map<string, number>();
  private readonly histograms= new Map<string, HistogramData>();

  private key(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return name;
    const lStr = Object.entries(labels).sort(([a],[b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`).join(",");
    return `${name}{${lStr}}`;
  }

  // ── Counters ───────────────────────────────────────────────────────────────

  increment(name: string, amount = 1, labels?: Record<string, string>): void {
    const k = this.key(name, labels);
    this.counters.set(k, (this.counters.get(k) ?? 0) + amount);
  }

  getCounter(name: string, labels?: Record<string, string>): number {
    return this.counters.get(this.key(name, labels)) ?? 0;
  }

  // ── Gauges ─────────────────────────────────────────────────────────────────

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.gauges.set(this.key(name, labels), value);
  }

  adjustGauge(name: string, delta: number, labels?: Record<string, string>): void {
    const k = this.key(name, labels);
    this.gauges.set(k, (this.gauges.get(k) ?? 0) + delta);
  }

  getGauge(name: string, labels?: Record<string, string>): number {
    return this.gauges.get(this.key(name, labels)) ?? 0;
  }

  // ── Histograms ─────────────────────────────────────────────────────────────

  observe(name: string, value: number, labels?: Record<string, string>): void {
    const k = this.key(name, labels);
    let h = this.histograms.get(k);
    if (!h) {
      h = { count: 0, sum: 0, min: Infinity, max: -Infinity, p50: 0, p95: 0, p99: 0, buckets: [] };
      this.histograms.set(k, h);
    }
    h.count++;
    h.sum   += value;
    h.min    = Math.min(h.min, value);
    h.max    = Math.max(h.max, value);
    // Keep last 1000 observations for percentile calculation
    if (h.buckets.length >= 1000) h.buckets.shift();
    h.buckets.push(value);
    // Recompute percentiles
    const sorted = [...h.buckets].sort((a, b) => a - b);
    h.p50 = percentile(sorted, 0.50);
    h.p95 = percentile(sorted, 0.95);
    h.p99 = percentile(sorted, 0.99);
  }

  getHistogram(name: string, labels?: Record<string, string>): HistogramData | undefined {
    return this.histograms.get(this.key(name, labels));
  }

  // ── Snapshot (for dashboard) ───────────────────────────────────────────────

  snapshot(): {
    counters:   Record<string, number>;
    gauges:     Record<string, number>;
    histograms: Record<string, Omit<HistogramData, "buckets"> & { avg: number }>;
  } {
    const histSnap: Record<string, Omit<HistogramData, "buckets"> & { avg: number }> = {};
    for (const [k, h] of this.histograms) {
      const { buckets: _, ...rest } = h;
      histSnap[k] = { ...rest, avg: h.count > 0 ? Math.round(h.sum / h.count * 10) / 10 : 0 };
    }
    return {
      counters:   Object.fromEntries(this.counters),
      gauges:     Object.fromEntries(this.gauges),
      histograms: histSnap,
    };
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(sorted.length * p) - 1;
  return Math.round(sorted[Math.max(0, idx)] * 10) / 10;
}

// ── Singleton ─────────────────────────────────────────────────────────────────
export const metricsService = new MetricsService();
export default metricsService;
