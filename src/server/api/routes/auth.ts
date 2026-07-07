import { Router } from "express";
import rateLimit from "express-rate-limit";
import { config } from "../../config.js";
import { authenticate } from "../auth.middleware.js";
import {
  registerHandler, loginHandler, refreshHandler, logoutHandler,
  forgotPasswordHandler, resetPasswordHandler,
  getMeHandler, updateProfileHandler, changePasswordHandler,
} from "../controllers/auth.controller.js";

const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later.", code: "RATE_LIMITED" },
});

const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Public — rate limited
router.post("/register",         authLimiter,    registerHandler);
router.post("/login",            authLimiter,    loginHandler);
router.post("/refresh",          generalLimiter, refreshHandler);
router.post("/forgot-password",  authLimiter,    forgotPasswordHandler);
router.post("/reset-password",   authLimiter,    resetPasswordHandler);

// Authenticated
router.post  ("/logout",   authenticate, logoutHandler);
router.get   ("/me",       authenticate, getMeHandler);
router.patch ("/profile",  authenticate, updateProfileHandler);
router.patch ("/password", authenticate, changePasswordHandler);

export default router;
