/**
 * Operations Routes — Phase I.7
 *
 * All routes under /api/v1/operations (requires business context via withBusiness).
 */

import { Router } from "express";
import { withBusiness } from "../middleware.js";
import { authorize } from "../auth.middleware.js";
import {
  getDashboardHandler,
  getSystemHandler,
  getErrorsHandler,
  getJobsHandler,
  runJobHandler,
  getMetricsHandler,
  getPerformanceHandler,
  getActivityHandler,
  getAuditHandler,
  getAuditUsersHandler,
  getAuditBusinessesHandler,
  getStatusHandler,
  updateStatusHandler,
  getFeaturesHandler,
  updateFeatureHandler,
  testAlertHandler,
} from "../controllers/operations.controller.js";

const ops = Router();

// All routes require business context
ops.use(withBusiness);

// authenticate() already ran in v1.ts before this router was mounted, so
// req.user is set here. Reads stay open to any authenticated role (viewer
// included, matching v1.ts's "viewer: GET everything" baseline); the write
// actions below (maintenance mode, feature flags, running a job, testing
// alerts) are admin+ only — not part of agent's 4-resource CRM grant.
const adminPlus = authorize("admin", "owner");

// ── Dashboard ─────────────────────────────────────────────────────────────────
ops.get  ("/operations/dashboard",            getDashboardHandler);
ops.get  ("/operations/system",               getSystemHandler);
ops.get  ("/operations/errors",               getErrorsHandler);
ops.get  ("/operations/metrics",              getMetricsHandler);
ops.get  ("/operations/performance",          getPerformanceHandler);
ops.get  ("/operations/activity",             getActivityHandler);
ops.get  ("/operations/jobs",                 getJobsHandler);
ops.post ("/operations/jobs/:id/run",         adminPlus, runJobHandler);

// ── Audit ─────────────────────────────────────────────────────────────────────
ops.get  ("/operations/audit",                getAuditHandler);
ops.get  ("/operations/audit/users",          getAuditUsersHandler);
ops.get  ("/operations/audit/businesses",     getAuditBusinessesHandler);

// ── Maintenance mode ──────────────────────────────────────────────────────────
ops.get  ("/operations/status",               getStatusHandler);
ops.patch("/operations/status",               adminPlus, updateStatusHandler);

// ── Feature flags ─────────────────────────────────────────────────────────────
ops.get  ("/operations/features",             getFeaturesHandler);
ops.patch("/operations/features/:key",        adminPlus, updateFeatureHandler);

// ── Alerts ────────────────────────────────────────────────────────────────────
ops.post ("/operations/alerts/test",          adminPlus, testAlertHandler);

export default ops;
