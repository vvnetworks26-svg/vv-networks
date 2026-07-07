import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createHash } from "crypto";
import { config } from "../config.js";
import { refreshTokenRepository } from "../../database/repositories/RefreshTokenRepository.js";
import type { UserRole } from "../../database/models/User.js";

export interface AccessTokenPayload {
  sub: string;        // userId
  bid: string;        // businessId
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtAccessExpiry } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwtSecret) as AccessTokenPayload;
}

export async function issueTokenPair(
  userId: string,
  businessId: string,
  role: UserRole,
  email: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<TokenPair> {
  const accessToken = signAccessToken({ sub: userId, bid: businessId, role, email });

  const rawRefresh = crypto.randomBytes(64).toString("hex");
  const tokenHash = hashToken(rawRefresh);
  const family = crypto.randomUUID();

  const expiresAt = new Date();
  // Parse refresh expiry (e.g. "30d" → 30 days)
  const expMatch = config.jwtRefreshExpiry.match(/^(\d+)([dhms])$/);
  if (expMatch) {
    const amount = parseInt(expMatch[1], 10);
    const unit = expMatch[2];
    const ms = unit === "d" ? 86400000 : unit === "h" ? 3600000 : unit === "m" ? 60000 : 1000;
    expiresAt.setTime(expiresAt.getTime() + amount * ms);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 30);
  }

  await refreshTokenRepository.create({
    userId, businessId, tokenHash, family,
    expiresAt, ...meta,
  } as any);

  return { accessToken, refreshToken: rawRefresh };
}

export async function rotateRefreshToken(
  rawRefreshToken: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<{ tokens: TokenPair; userId: string; businessId: string; role: UserRole; email: string } | null> {
  const tokenHash = hashToken(rawRefreshToken);
  const stored = await refreshTokenRepository.findValidByHash(tokenHash);

  if (!stored) {
    // Token not found — possible reuse attack. If family exists, revoke entire family.
    const familyToken = await refreshTokenRepository.findOne({ tokenHash });
    if (familyToken) {
      await refreshTokenRepository.revokeFamily(familyToken.family);
    }
    return null;
  }

  // Revoke the used token (rotation)
  await refreshTokenRepository.revokeByHash(tokenHash);

  // Issue a new pair
  const { User } = await import("../../database/models/User.js");
  const user = await User.findById(stored.userId).select("+role +email").exec();
  if (!user || !user.isActive) return null;

  const tokens = await issueTokenPair(
    String(user._id),
    String(stored.businessId),
    user.role,
    user.email,
    meta
  );

  return {
    tokens,
    userId: String(user._id),
    businessId: String(stored.businessId),
    role: user.role,
    email: user.email,
  };
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await refreshTokenRepository.revokeByHash(tokenHash);
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await refreshTokenRepository.revokeAllForUser(userId);
}
