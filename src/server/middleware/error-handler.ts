/**
 * Global Error Handler Middleware — Phase I.6
 */

import type { Request, Response, NextFunction } from "express";
import logger from "../logger.js";
import { config } from "../config.js";

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const correlationId = (req as any).correlationId as string | undefined;
  const reqLogger = logger.child({ correlationId });

  const isError = err instanceof Error;
  const status  = (err as any)?.status ?? (err as any)?.statusCode ?? 500;
  const message = isError ? err.message : "Internal server error";
  const code    = (err as any)?.code;

  reqLogger.exception("Unhandled error in request", err, {
    method: req.method,
    url:    req.originalUrl,
    status,
  });

  // Never expose stack traces in production
  const body: Record<string, unknown> = {
    success: false,
    error:   config.isProd ? "Internal server error" : message,
    code,
  };

  if (!config.isProd && isError && err.stack) {
    body["stack"] = err.stack;
  }

  res.status(status).json(body);
}
