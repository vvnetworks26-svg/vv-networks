/**
 * Structured Logger — Phase I.6
 *
 * Supports:
 *  - Levels: debug | info | warn | error | fatal
 *  - JSON output (production) or pretty-printed (development)
 *  - Correlation IDs per request
 *  - Automatic sensitive field masking
 *  - Child loggers for sub-contexts
 */

import { config } from "./config.js";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info:  20,
  warn:  30,
  error: 40,
  fatal: 50,
};

const COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m",   // cyan
  info:  "\x1b[32m",   // green
  warn:  "\x1b[33m",   // yellow
  error: "\x1b[31m",   // red
  fatal: "\x1b[35m",   // magenta
};
const RESET = "\x1b[0m";

// ── Sensitive field masking ───────────────────────────────────────────────────
const SENSITIVE_KEYS = new Set([
  "password", "passwordHash", "token", "secret", "apiKey", "api_key",
  "authorization", "cookie", "jwt", "accessToken", "refreshToken",
  "stripeSecretKey", "stripeWebhookSecret", "mongoUri", "connectionString",
  "creditCard", "cardNumber", "cvv", "ssn",
]);

function maskSensitive(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => maskSensitive(v, depth + 1));

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const lower = k.toLowerCase();
    const isSensitive = [...SENSITIVE_KEYS].some((s) => lower.includes(s.toLowerCase()));
    result[k] = isSensitive ? "[REDACTED]" : maskSensitive(v, depth + 1);
  }
  return result;
}

// ── Log entry ─────────────────────────────────────────────────────────────────
export interface LogEntry {
  level:     LogLevel;
  message:   string;
  timestamp: string;
  service:   string;
  env:       string;
  version:   string;
  commit:    string;
  correlationId?: string;
  requestId?:     string;
  userId?:        string;
  businessId?:    string;
  duration?:      number;
  error?:         { message: string; stack?: string; code?: string };
  [key: string]:  unknown;
}

export interface LogContext {
  correlationId?: string;
  requestId?:     string;
  userId?:        string;
  businessId?:    string;
  [key: string]:  unknown;
}

// ── Logger class ──────────────────────────────────────────────────────────────
class Logger {
  private readonly minLevel: number;
  private readonly context: LogContext;

  constructor(context: LogContext = {}) {
    this.minLevel = LEVELS[config.logLevel as LogLevel] ?? LEVELS.info;
    this.context  = context;
  }

  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  private write(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVELS[level] < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service:   config.appName,
      env:       config.nodeEnv,
      version:   config.appVersion,
      commit:    config.gitCommit,
      ...this.context,
      ...(data ? maskSensitive(data) as Record<string, unknown> : {}),
    };

    if (config.logFormat === "json") {
      process.stdout.write(JSON.stringify(entry) + "\n");
    } else {
      this.prettyPrint(entry);
    }

    // Fatal kills the process after flush
    if (level === "fatal") {
      process.exitCode = 1;
    }
  }

  private prettyPrint(entry: LogEntry): void {
    const color = COLORS[entry.level] ?? "";
    const ts    = entry.timestamp.slice(11, 23);      // HH:MM:SS.mmm
    const lvl   = entry.level.toUpperCase().padEnd(5);
    const cid   = entry.correlationId ? ` [${entry.correlationId.slice(0, 8)}]` : "";

    const extras: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(entry)) {
      if (!["level","message","timestamp","service","env","version","commit","correlationId"].includes(k)) {
        extras[k] = v;
      }
    }

    let line = `${color}${ts} ${lvl}${RESET}${cid} ${entry.message}`;
    if (Object.keys(extras).length > 0) {
      line += `  ${JSON.stringify(extras)}`;
    }

    if (["error","fatal"].includes(entry.level)) {
      process.stderr.write(line + "\n");
    } else {
      process.stdout.write(line + "\n");
    }
  }

  debug(message: string, data?: Record<string, unknown>): void { this.write("debug", message, data); }
  info (message: string, data?: Record<string, unknown>): void { this.write("info",  message, data); }
  warn (message: string, data?: Record<string, unknown>): void { this.write("warn",  message, data); }
  error(message: string, data?: Record<string, unknown>): void { this.write("error", message, data); }
  fatal(message: string, data?: Record<string, unknown>): void { this.write("fatal", message, data); }

  /** Convenience: log an Error object at error level */
  exception(message: string, err: unknown, data?: Record<string, unknown>): void {
    const error = err instanceof Error
      ? { message: err.message, stack: config.isDev ? err.stack : undefined, code: (err as any).code }
      : { message: String(err) };
    this.write("error", message, { ...data, error });
  }
}

// ── Singleton root logger ─────────────────────────────────────────────────────
export const logger = new Logger();

export default logger;
