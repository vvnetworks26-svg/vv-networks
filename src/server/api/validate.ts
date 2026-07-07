import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";
import { badRequest } from "./response.js";

function formatZodErrors(err: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "root";
    if (!fields[key]) fields[key] = [];
    fields[key].push(issue.message);
  }
  return fields;
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      badRequest(res, "Validation failed", formatZodErrors(result.error));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      badRequest(res, "Invalid query parameters", formatZodErrors(result.error));
      return;
    }
    (req as any).parsedQuery = result.data;
    next();
  };
}
