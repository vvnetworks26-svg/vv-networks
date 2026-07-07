import { User } from "../../database/models/User.js";
import { businessRepository } from "../../database/repositories/BusinessRepository.js";
import { userRepository } from "../../database/repositories/UserRepository.js";
import { passwordResetTokenRepository } from "../../database/repositories/PasswordResetTokenRepository.js";
import { hashPassword, comparePassword, generateResetToken, hashTokenRaw } from "./password.service.js";
import { issueTokenPair, revokeRefreshToken, revokeAllUserTokens, type TokenPair } from "./token.service.js";
import { audit } from "./audit.service.js";
import { sendPasswordResetEmail } from "./email.service.js";
import type { Request } from "express";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  businessId: string;
  role?: "owner" | "admin" | "agent" | "viewer";
}

export interface LoginInput {
  email: string;
  password: string;
  businessId: string;
}

export interface AuthResult {
  tokens: TokenPair;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    businessId: string;
    avatarUrl?: string;
  };
}

export async function register(input: RegisterInput, req: Request): Promise<AuthResult> {
  // Verify business exists
  const business = await businessRepository.findById(input.businessId);
  if (!business) throw Object.assign(new Error("Business not found"), { code: "BUSINESS_NOT_FOUND", status: 404 });

  // Check duplicate email within business
  const existing = await userRepository.findByEmail(input.businessId, input.email);
  if (existing) throw Object.assign(new Error("Email already registered"), { code: "EMAIL_EXISTS", status: 409 });

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    businessId: input.businessId,
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash,
    role: input.role ?? "agent",
    isActive: true,
  });

  const tokens = await issueTokenPair(
    String(user._id), input.businessId, user.role, user.email,
    { ipAddress: req.socket.remoteAddress, userAgent: req.headers["user-agent"] }
  );

  await audit("auth.register", { req, userId: String(user._id), businessId: input.businessId });

  return {
    tokens,
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role, businessId: input.businessId },
  };
}

export async function login(input: LoginInput, req: Request): Promise<AuthResult> {
  const user = await User.findOne({
    businessId: input.businessId,
    email: input.email.toLowerCase().trim(),
    deletedAt: null,
  }).select("+passwordHash").exec();

  if (!user || !user.passwordHash) {
    await audit("auth.login_failed", { req, meta: { email: input.email } });
    throw Object.assign(new Error("Invalid credentials"), { code: "INVALID_CREDENTIALS", status: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error("Account is disabled"), { code: "ACCOUNT_DISABLED", status: 403 });
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    await audit("auth.login_failed", { req, userId: String(user._id), meta: { email: input.email } });
    throw Object.assign(new Error("Invalid credentials"), { code: "INVALID_CREDENTIALS", status: 401 });
  }

  // Update last login
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() }).exec();

  const tokens = await issueTokenPair(
    String(user._id), String(user.businessId), user.role, user.email,
    { ipAddress: req.socket.remoteAddress, userAgent: req.headers["user-agent"] }
  );

  await audit("auth.login", { req, userId: String(user._id), businessId: String(user.businessId) });

  return {
    tokens,
    user: {
      id: String(user._id), name: user.name, email: user.email,
      role: user.role, businessId: String(user.businessId),
    },
  };
}

export async function logout(rawRefreshToken: string, userId: string, req: Request): Promise<void> {
  await revokeRefreshToken(rawRefreshToken);
  await audit("auth.logout", { req, userId });
}

export async function logoutAll(userId: string, req: Request): Promise<void> {
  await revokeAllUserTokens(userId);
  await audit("auth.logout", { req, userId, meta: { all: true } });
}

export async function forgotPassword(email: string, businessId: string, req: Request): Promise<void> {
  const user = await userRepository.findByEmail(businessId, email);
  if (!user) return; // Never reveal whether email exists

  // Revoke any existing tokens
  await passwordResetTokenRepository.revokeAllForUser(String(user._id));

  const { raw, hash, expiresAt } = generateResetToken();
  await passwordResetTokenRepository.create({ userId: user._id, tokenHash: hash, expiresAt } as any);

  await sendPasswordResetEmail(user.email, raw);
  await audit("auth.password_reset_request", { req, userId: String(user._id), businessId });
}

export async function resetPassword(rawToken: string, newPassword: string, req: Request): Promise<void> {
  const hash = hashTokenRaw(rawToken);
  const tokenDoc = await passwordResetTokenRepository.findValid(hash);
  if (!tokenDoc) throw Object.assign(new Error("Invalid or expired reset token"), { code: "INVALID_TOKEN", status: 400 });

  const passwordHash = await hashPassword(newPassword);
  await User.updateOne({ _id: tokenDoc.userId }, { passwordHash }).exec();
  await passwordResetTokenRepository.markUsed(String(tokenDoc._id));
  await revokeAllUserTokens(String(tokenDoc.userId));

  await audit("auth.password_reset_complete", { req, userId: String(tokenDoc.userId) });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string, req: Request): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash").exec();
  if (!user || !user.passwordHash) throw Object.assign(new Error("User not found"), { status: 404 });

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw Object.assign(new Error("Current password is incorrect"), { code: "INVALID_PASSWORD", status: 400 });

  const passwordHash = await hashPassword(newPassword);
  await User.updateOne({ _id: userId }, { passwordHash }).exec();
  await revokeAllUserTokens(userId);

  await audit("auth.password_change", { req, userId });
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId).exec();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, businessId: String(user.businessId), avatarUrl: user.avatarUrl, lastLoginAt: user.lastLoginAt };
}

export async function updateProfile(userId: string, data: { name?: string; avatarUrl?: string }, req: Request) {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true }).exec();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  await audit("auth.profile_update", { req, userId });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, businessId: String(user.businessId), avatarUrl: user.avatarUrl };
}
