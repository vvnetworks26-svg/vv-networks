/**
 * PerformanceService — Phase I.7
 *
 * Tracks per-endpoint latency and identifies slow paths.
 * Feeds into the operational dashboard.
 */

import metricsService, { METRIC } from "./metrics.service.js";

interface EndpointStat {
  route:     string;
  method:    string;
  count:     number;
  totalMs:   number;
  minMs:     number;
  maxMs:     number;
  p95Ms:     number;
  p99Ms:     number;
  errors:    number;
  lastSeen:  Date;
  observations: number[];  // capped at 500
}

class PerformanceService {
  private readonly endpoints = new Map<string, EndpointStat>();

  private static readonly MAX_OBS = 500;
  private static readonly SLOW_MS = 1000;

  record(method: string, route: string, durationMs: number, statusCode: number): void {
    const key = `${method.toUpperCase()} ${route}`;
    let stat = this.endpoints.get(key);
    if (!stat) {
      stat = {
        route, method: method.toUpperCase(),
        count: 0, totalMs: 0, minMs: Infinity, maxMs: -Infinity,
        p95Ms: 0, p99Ms: 0, errors: 0,
        lastSeen: new Date(), observations: [],
      };
      this.endpoints.set(key, stat);
    }

    stat.count++;
    stat.totalMs  += durationMs;
    stat.minMs     = Math.min(stat.minMs, durationMs);
    stat.maxMs     = Math.max(stat.maxMs, durationMs);
    stat.lastSeen  = new Date();
    if (statusCode >= 400) stat.errors++;

    if (stat.observations.length >= PerformanceService.MAX_OBS) stat.observations.shift();
    stat.observations.push(durationMs);

    const sorted = [...stat.observations].sort((a, b) => a - b);
    stat.p95Ms = pct(sorted, 0.95);
    stat.p99Ms = pct(sorted, 0.99);

    // Feed into central metrics
    metricsService.observe(METRIC.HTTP_DURATION_MS, durationMs, { method: method.toUpperCase() });

    if (durationMs > PerformanceService.SLOW_MS) {
      metricsService.increment("http.slow_requests.total");
    }
  }

  getAll(): Array<Omit<EndpointStat, "observations"> & { avgMs: number }> {
    return [...this.endpoints.values()]
      .map(({ observations: _, ...s }) => ({
        ...s,
        avgMs: s.count > 0 ? Math.round(s.totalMs / s.count) : 0,
        minMs: s.minMs === Infinity ? 0 : s.minMs,
        maxMs: s.maxMs === -Infinity ? 0 : s.maxMs,
      }))
      .sort((a, b) => b.p95Ms - a.p95Ms);
  }

  getSlowest(n = 10): ReturnType<typeof this.getAll> {
    return this.getAll().slice(0, n);
  }

  getMostFrequent(n = 10): ReturnType<typeof this.getAll> {
    return [...this.getAll()].sort((a, b) => b.count - a.count).slice(0, n);
  }

  getHighErrorRate(minRequests = 10): ReturnType<typeof this.getAll> {
    return this.getAll()
      .filter((s) => s.count >= minRequests && s.errors / s.count > 0.05)
      .sort((a, b) => (b.errors / b.count) - (a.errors / a.count));
  }

  getSummary(): {
    totalRequests:  number;
    avgLatencyMs:   number;
    p95LatencyMs:   number;
    p99LatencyMs:   number;
    errorRate:      number;
    slowRequests:   number;
    endpointCount:  number;
  } {
    const all = this.getAll();
    const totalReq   = all.reduce((s, e) => s + e.count, 0);
    const totalMs    = all.reduce((s, e) => s + e.totalMs, 0);
    const totalErrors= all.reduce((s, e) => s + e.errors, 0);
    // Aggregate p95 / p99 from all observations
    const allObs: number[] = [];
    for (const [, s] of this.endpoints) allObs.push(...s.observations);
    const sorted = allObs.sort((a, b) => a - b);

    return {
      totalRequests:  totalReq,
      avgLatencyMs:   totalReq > 0 ? Math.round(totalMs / totalReq) : 0,
      p95LatencyMs:   pct(sorted, 0.95),
      p99LatencyMs:   pct(sorted, 0.99),
      errorRate:      totalReq > 0 ? Math.round((totalErrors / totalReq) * 10000) / 100 : 0,
      slowRequests:   metricsService.getCounter("http.slow_requests.total"),
      endpointCount:  this.endpoints.size,
    };
  }
}

function pct(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(sorted.length * p) - 1;
  return Math.round(sorted[Math.max(0, idx)] * 10) / 10;
}

export const performanceService = new PerformanceService();
export default performanceService;
