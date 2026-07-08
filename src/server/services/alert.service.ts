/**
 * AlertService — Phase I.7
 *
 * Channels:  console | email (stub) | slack (stub) | webhook (stub)
 * Severities: warning | critical | fatal
 *
 * Triggers:
 *   - Database disconnected
 *   - Memory > threshold
 *   - CPU > threshold
 *   - Error rate spike
 *   - Failed login spike
 *   - Payment failures spike
 */

import logger from "../logger.js";
import { config } from "../config.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AlertSeverity = "warning" | "critical" | "fatal";
export type AlertChannel  = "console" | "email" | "slack" | "webhook";

export interface Alert {
  id:         string;
  title:      string;
  message:    string;
  severity:   AlertSeverity;
  trigger:    string;
  data?:      Record<string, unknown>;
  firedAt:    Date;
  resolvedAt?: Date;
}

export interface AlertRule {
  trigger:    string;
  title:      string;
  severity:   AlertSeverity;
  cooldownMs: number;  // minimum ms between same-trigger alerts
  channels:   AlertChannel[];
  check(data: Record<string, unknown>): string | null;  // returns message if triggered, null otherwise
}

// ── Channel implementations ───────────────────────────────────────────────────

async function sendConsole(alert: Alert): Promise<void> {
  const method = alert.severity === "fatal"    ? "fatal"
               : alert.severity === "critical" ? "error"
               : "warn";
  logger[method](`[Alert:${alert.severity.toUpperCase()}] ${alert.title}`, {
    message: alert.message,
    trigger: alert.trigger,
    data:    alert.data,
  });
}

async function sendEmail(_alert: Alert): Promise<void> {
  // Stub — wire Resend/SendGrid when email service is ready
  logger.debug("[Alert] Email channel stub — not yet configured");
}

async function sendSlack(_alert: Alert): Promise<void> {
  // Stub — set SLACK_WEBHOOK_URL to activate
  if (!process.env["SLACK_WEBHOOK_URL"]) {
    logger.debug("[Alert] Slack channel stub — SLACK_WEBHOOK_URL not set");
    return;
  }
  try {
    await fetch(process.env["SLACK_WEBHOOK_URL"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `[${_alert.severity.toUpperCase()}] *${_alert.title}*\n${_alert.message}`,
        attachments: [{
          color: _alert.severity === "fatal" ? "#FF0000"
               : _alert.severity === "critical" ? "#FF6600" : "#FFAA00",
          fields: Object.entries(_alert.data ?? {}).map(([title, value]) => ({
            title, value: String(value), short: true,
          })),
        }],
      }),
    });
  } catch (err) {
    logger.warn("[Alert] Slack send failed", { error: String(err) });
  }
}

async function sendWebhook(alert: Alert): Promise<void> {
  const url = process.env["ALERT_WEBHOOK_URL"];
  if (!url) {
    logger.debug("[Alert] Webhook channel stub — ALERT_WEBHOOK_URL not set");
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alert),
    });
  } catch (err) {
    logger.warn("[Alert] Webhook send failed", { error: String(err) });
  }
}

// ── AlertService ──────────────────────────────────────────────────────────────

class AlertService {
  private readonly history: Alert[] = [];
  private readonly lastFired = new Map<string, number>();  // trigger → timestamp
  private static readonly MAX_HISTORY = 200;

  private readonly rules: AlertRule[] = [
    {
      trigger:    "db.disconnected",
      title:      "Database disconnected",
      severity:   "critical",
      cooldownMs: 60_000,
      channels:   ["console", "slack", "webhook"],
      check: (d) => d["connected"] === false
        ? `MongoDB connection lost. ReadyState: ${d["readyState"]}` : null,
    },
    {
      trigger:    "memory.high",
      title:      "High memory usage",
      severity:   "warning",
      cooldownMs: 300_000,
      channels:   ["console", "slack"],
      check: (d) => {
        const heap = d["heapUsedMB"] as number;
        return heap > 400 ? `Heap usage is ${heap}MB (threshold: 400MB)` : null;
      },
    },
    {
      trigger:    "memory.critical",
      title:      "Critical memory usage",
      severity:   "critical",
      cooldownMs: 60_000,
      channels:   ["console", "slack", "webhook"],
      check: (d) => {
        const heap = d["heapUsedMB"] as number;
        return heap > 600 ? `Heap usage is ${heap}MB (threshold: 600MB)` : null;
      },
    },
    {
      trigger:    "event_loop.lag",
      title:      "High event loop lag",
      severity:   "warning",
      cooldownMs: 120_000,
      channels:   ["console"],
      check: (d) => {
        const lag = d["lagMs"] as number;
        return lag > 100 ? `Event loop lag is ${lag}ms (threshold: 100ms)` : null;
      },
    },
    {
      trigger:    "auth.failures.spike",
      title:      "Login failure spike detected",
      severity:   "warning",
      cooldownMs: 300_000,
      channels:   ["console", "slack"],
      check: (d) => {
        const count = d["count"] as number;
        return count > 20 ? `${count} failed logins in the last minute` : null;
      },
    },
    {
      trigger:    "payments.failures.spike",
      title:      "Payment failure spike detected",
      severity:   "critical",
      cooldownMs: 600_000,
      channels:   ["console", "slack", "webhook"],
      check: (d) => {
        const rate = d["failureRate"] as number;
        return rate > 0.3 ? `Payment failure rate is ${Math.round(rate * 100)}% (threshold: 30%)` : null;
      },
    },
    {
      trigger:    "error.rate.spike",
      title:      "API error rate spike",
      severity:   "critical",
      cooldownMs: 300_000,
      channels:   ["console", "slack"],
      check: (d) => {
        const rate = d["errorRate"] as number;
        return rate > 10 ? `Error rate is ${rate}% (threshold: 10%)` : null;
      },
    },
  ];

  async fire(triggerName: string, data: Record<string, unknown> = {}): Promise<Alert | null> {
    const rule = this.rules.find((r) => r.trigger === triggerName);
    if (!rule) return null;

    const message = rule.check(data);
    if (!message) return null;

    // Cooldown check
    const lastFiredAt = this.lastFired.get(triggerName) ?? 0;
    if (Date.now() - lastFiredAt < rule.cooldownMs) return null;
    this.lastFired.set(triggerName, Date.now());

    const alert: Alert = {
      id:       `alrt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title:    rule.title,
      message,
      severity: rule.severity,
      trigger:  triggerName,
      data,
      firedAt:  new Date(),
    };

    // Store history
    if (this.history.length >= AlertService.MAX_HISTORY) this.history.shift();
    this.history.push(alert);

    // Send to all channels in parallel
    await Promise.allSettled(rule.channels.map((ch) => this.send(ch, alert)));

    return alert;
  }

  private async send(channel: AlertChannel, alert: Alert): Promise<void> {
    switch (channel) {
      case "console": return sendConsole(alert);
      case "email":   return sendEmail(alert);
      case "slack":   return sendSlack(alert);
      case "webhook": return sendWebhook(alert);
    }
  }

  /** Manually fire an ad-hoc alert */
  async custom(opts: {
    title:    string;
    message:  string;
    severity: AlertSeverity;
    trigger?: string;
    channels?: AlertChannel[];
    data?:    Record<string, unknown>;
  }): Promise<Alert> {
    const alert: Alert = {
      id:       `alrt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title:    opts.title,
      message:  opts.message,
      severity: opts.severity,
      trigger:  opts.trigger ?? "manual",
      data:     opts.data,
      firedAt:  new Date(),
    };

    if (this.history.length >= AlertService.MAX_HISTORY) this.history.shift();
    this.history.push(alert);

    const channels: AlertChannel[] = opts.channels ?? ["console"];
    await Promise.allSettled(channels.map((ch) => this.send(ch, alert)));
    return alert;
  }

  getHistory(limit = 50): Alert[] {
    return this.history.slice(-limit).reverse();
  }

  getActiveRules(): AlertRule[] {
    return this.rules;
  }

  /** Auto-check all triggers — call from a periodic health check */
  async autoCheck(data: {
    connected: boolean;
    readyState: number;
    heapUsedMB: number;
    lagMs: number;
    errorRate: number;
  }): Promise<void> {
    await Promise.allSettled([
      this.fire("db.disconnected",    { connected: data.connected, readyState: data.readyState }),
      this.fire("memory.high",        { heapUsedMB: data.heapUsedMB }),
      this.fire("memory.critical",    { heapUsedMB: data.heapUsedMB }),
      this.fire("event_loop.lag",     { lagMs: data.lagMs }),
      this.fire("error.rate.spike",   { errorRate: data.errorRate }),
    ]);
  }
}

export const alertService = new AlertService();
export default alertService;
