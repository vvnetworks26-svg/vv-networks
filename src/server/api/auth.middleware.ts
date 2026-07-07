import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "../services/token.service.js";
import type { UserRole } from "../../database/models/User.js";

export interface AuthRequest extends Request {
  user: AccessTokenPayload;
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

/** Require a valid JWT. Attaches req.user = payload. */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const raw = extractToken(req);
  if (!raw) {
    res.status(401).json({ success: false, error: "Authentication required", code: "UNAUTHENTICATED" });
    return;
  }
  try {
    const payload = verifyAccessToken(raw);
    (req as AuthRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Token invalid or expired", code: "INVALID_TOKEN" });
  }
}

/** Optional auth — attaches req.user if token present, never blocks. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const raw = extractToken(req);
  if (raw) {
    try {
      const payload = verifyAccessToken(raw);
      (req as AuthRequest).user = payload;
    } catch { /* ignore */ }
  }
  next();
}

/** Require specific roles. Must come AFTER authenticate(). */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: "Authentication required", code: "UNAUTHENTICATED" });
      return;
    }
    if (!roles.includes(user.role as UserRole)) {
      res.status(403).json({ success: false, error: "Insufficient permissions", code: "FORBIDDEN" });
      return;
    }
    next();
  };
}

/** Ensure the authenticated user belongs to a specific business (or req.businessId). */
export function requireBusiness(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user;
  if (!user) {
    res.status(401).json({ success: false, error: "Authentication required", code: "UNAUTHENTICATED" });
    return;
  }
  // Inject businessId from token so downstream middleware can use it
  (req as any).businessId = user.bid;
  next();
}
