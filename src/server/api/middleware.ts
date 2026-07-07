import type { Request, Response, NextFunction } from "express";
import { businessRepository } from "../../database/repositories/BusinessRepository.js";
import { serverError } from "./response.js";

/**
 * Resolves the VV Networks business record and attaches its ID to req.
 * In Phase D.2 this will be replaced by JWT auth that extracts businessId
 * from the token. For now it resolves the first active business.
 */
export async function withBusiness(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const businesses = await businessRepository.findActive();
    if (businesses.length === 0) {
      serverError(res, "No active business found");
      return;
    }
    (req as any).businessId = String(businesses[0]._id);
    next();
  } catch {
    serverError(res, "Failed to resolve business context");
  }
}

export function getBid(req: Request): string {
  return (req as any).businessId as string;
}
