import type { Request, Response } from "express";
import { z } from "zod";
import { ok, created, badRequest, serverError } from "../response.js";
import { rotateRefreshToken } from "../../services/token.service.js";
import {
  register, login, logout, forgotPassword,
  resetPassword, changePassword, getProfile, updateProfile,
} from "../../services/auth.service.js";
import type { AuthRequest } from "../auth.middleware.js";

// ── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name:       z.string().min(1).max(100),
  email:      z.string().email(),
  password:   z.string().min(8).max(128),
  businessId: z.string().min(1),
  role:       z.enum(["owner","admin","agent","viewer"]).optional(),
});

const loginSchema = z.object({
  email:      z.string().email(),
  password:   z.string().min(1),
  businessId: z.string().min(1),
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

const forgotSchema = z.object({
  email:      z.string().email(),
  businessId: z.string().min(1),
});

const resetSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(128),
});

const updateProfileSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

// ── Handlers ─────────────────────────────────────────────────────────────────
export async function registerHandler(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, "Validation failed", Object.fromEntries(parsed.error.issues.map(i => [i.path.join("."), [i.message]])));
    return;
  }
  try {
    const result = await register(parsed.data as typeof parsed.data & { name: string; email: string; password: string; businessId: string }, req);
    created(res, result);
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message, code: err.code });
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, "Validation failed", Object.fromEntries(parsed.error.issues.map(i => [i.path.join("."), [i.message]])));
    return;
  }
  try {
    const result = await login(parsed.data as typeof parsed.data & { email: string; password: string; businessId: string }, req);
    ok(res, result);
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message, code: err.code });
  }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, "Refresh token required"); return; }
  try {
    const result = await rotateRefreshToken(parsed.data.refreshToken, {
      ipAddress: req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
    if (!result) {
      res.status(401).json({ success: false, error: "Invalid or expired refresh token", code: "INVALID_REFRESH" });
      return;
    }
    ok(res, { tokens: result.tokens });
  } catch { serverError(res); }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  const user = (req as AuthRequest).user;
  if (parsed.success) {
    await logout(parsed.data.refreshToken, user.sub, req);
  }
  ok(res, { loggedOut: true });
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, "Valid email and businessId required"); return; }
  try {
    await forgotPassword(parsed.data.email, parsed.data.businessId, req);
    ok(res, { message: "If the email exists, a reset link has been sent." });
  } catch { serverError(res); }
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, "Token and new password are required"); return; }
  try {
    await resetPassword(parsed.data.token, parsed.data.password, req);
    ok(res, { message: "Password reset successfully." });
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message, code: err.code });
  }
}

export async function getMeHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as AuthRequest).user;
    const profile = await getProfile(user.sub);
    ok(res, profile);
  } catch { serverError(res); }
}

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, "Invalid profile data"); return; }
  try {
    const user = (req as AuthRequest).user;
    const updated = await updateProfile(user.sub, parsed.data, req);
    ok(res, updated);
  } catch { serverError(res); }
}

export async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, "Current and new password required"); return; }
  try {
    const user = (req as AuthRequest).user;
    await changePassword(user.sub, parsed.data.currentPassword, parsed.data.newPassword, req);
    ok(res, { message: "Password changed. All sessions have been revoked." });
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message, code: err.code });
  }
}
