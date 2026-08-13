import { Router } from "express";
import { withBusiness } from "../middleware.js";
import { authenticate, authorize } from "../auth.middleware.js";
import { validateBody, validateQuery } from "../validate.js";
import operationsRouter from "./operations.js";

// Schemas
import {
  updateBusinessSchema,
  createUserSchema, updateUserSchema,
  createLeadSchema, updateLeadSchema, leadSearchSchema,
  createConversationSchema, updateConversationSchema, createMessageSchema,
  createAppointmentSchema, updateAppointmentSchema,
  createContactRequestSchema, updateContactRequestSchema,
  createServiceSchema, updateServiceSchema,
  createWidgetSessionSchema, updateWidgetSessionSchema,
} from "../schemas.js";

// Controllers
import { getBusinessHandler, updateBusinessHandler } from "../controllers/business.controller.js";
import { listUsers, getUser, createUser, updateUser, deleteUser } from "../controllers/users.controller.js";
import {
  listLeads, getLead, createLeadHandler, updateLeadHandler,
  deleteLeadHandler, restoreLeadHandler, searchLeadsHandler, getLeadStatsHandler,
} from "../controllers/leads.controller.js";
import {
  listConversations, getConversation, createConversationHandler,
  updateConversationHandler, deleteConversationHandler,
  listMessages, createMessageHandler, getConversationStatsHandler,
} from "../controllers/conversations.controller.js";
import {
  listAppointments, getAppointment, createAppointmentHandler,
  updateAppointmentHandler, deleteAppointmentHandler,
  getUpcoming, getAppointmentStatsHandler,
} from "../controllers/appointments.controller.js";
import {
  listServices, getService, createServiceHandler, updateServiceHandler, deleteServiceHandler,
} from "../controllers/services.controller.js";
import { getAnalytics, getTimeline, getEvents } from "../controllers/analytics.controller.js";
import {
  listContactRequests, getContactRequest, createContactRequestHandler,
  updateContactRequestHandler, deleteContactRequestHandler,
} from "../controllers/contact-requests.controller.js";
import {
  listWidgetSessions, createWidgetSession, updateWidgetSession,
} from "../controllers/widget-sessions.controller.js";

const v1 = Router();

// PUBLIC: the live contact form (BookingForm.tsx) posts here with no auth
// token. Registered before v1.use(authenticate) below so Express matches it
// first and it never hits the auth gate. It still needs business context
// (getBid in the controller), so withBusiness is attached directly to this
// one route rather than via the router-wide v1.use(withBusiness) below.
v1.post("/contact-requests", withBusiness, validateBody(createContactRequestSchema), createContactRequestHandler);

// SECURITY: gate for the internal CRM API. Everything registered below this
// line requires a valid JWT (see auth.middleware.ts) — checked before any
// database access, so an unauthenticated call is rejected without touching
// Mongo. Without this, business, users, leads, conversations, appointments,
// services, analytics, and widget-sessions were reachable with no token at all.
v1.use(authenticate);

// Business context for every authenticated route below.
v1.use(withBusiness);

// ── Role model ────────────────────────────────────────────────────────────────
// viewer: GET only, everywhere.
// agent:  viewer + POST/PATCH on leads/conversations/appointments/contact-requests
//         (the day-to-day CRM actions). No DELETE anywhere. No access at all —
//         not even GET — to /users/*, /business, /services.
// admin, owner: full access everywhere, including DELETE, /users/*, /business,
//         /services, and the operations write endpoints below.
const agentPlus = authorize("agent", "admin", "owner");
const adminPlus = authorize("admin", "owner");
// /users, /business, /services are read-visible to viewer but not agent — the
// opposite of the usual viewer < agent ordering. That's what the given role
// baseline specifies (agent explicitly denied "access" to these, viewer's
// grant is unqualified "GET everything"); flagged here since it's the one
// non-obvious asymmetry in this matrix, not a mistake.
const viewerOrAdminPlus = authorize("viewer", "admin", "owner");

// ── Business ──────────────────────────────────────────────────────────────────
v1.get   ("/business",        viewerOrAdminPlus,                getBusinessHandler);
v1.patch ("/business",        adminPlus, validateBody(updateBusinessSchema), updateBusinessHandler);

// ── Users ────────────────────────────────────────────────────────────────────
v1.get   ("/users",           viewerOrAdminPlus,                listUsers);
v1.get   ("/users/:id",       viewerOrAdminPlus,                getUser);
v1.post  ("/users",           adminPlus, validateBody(createUserSchema),    createUser);
// SECURITY: authenticate() is required here so updateUser (users.controller.ts)
// can identify the caller — it enforces that only owner/admin may change
// another user's `role`, and that nobody may ever change their own `role`.
// adminPlus is an additional, router-level gate on top of that existing
// controller-level check — composed, not replacing it: adminPlus keeps
// viewer/agent out of this route entirely, while the controller's self-role
// check still applies to the owner/admin callers who get past it.
v1.patch ("/users/:id",       authenticate, adminPlus, validateBody(updateUserSchema),    updateUser);
v1.delete("/users/:id",       adminPlus,                        deleteUser);

// ── Leads ────────────────────────────────────────────────────────────────────
// GET: all authenticated roles (viewer included). Write: agent+. Delete: admin+.
v1.get   ("/leads/stats",                                    getLeadStatsHandler);
v1.get   ("/leads/search",    validateQuery(leadSearchSchema),   searchLeadsHandler);
v1.get   ("/leads",                                          listLeads);
v1.get   ("/leads/:id",                                      getLead);
v1.post  ("/leads",           agentPlus, validateBody(createLeadSchema),    createLeadHandler);
v1.patch ("/leads/:id",       agentPlus, validateBody(updateLeadSchema),    updateLeadHandler);
v1.delete("/leads/:id",       adminPlus,                     deleteLeadHandler);
v1.post  ("/leads/:id/restore", agentPlus,                   restoreLeadHandler);

// ── Conversations ─────────────────────────────────────────────────────────────
v1.get   ("/conversations/stats",                            getConversationStatsHandler);
v1.get   ("/conversations",                                  listConversations);
v1.get   ("/conversations/:id",                              getConversation);
v1.post  ("/conversations",   agentPlus, validateBody(createConversationSchema), createConversationHandler);
v1.patch ("/conversations/:id", agentPlus, validateBody(updateConversationSchema), updateConversationHandler);
v1.delete("/conversations/:id", adminPlus,                   deleteConversationHandler);
v1.get   ("/conversations/:id/messages",                     listMessages);
v1.post  ("/conversations/:id/messages", agentPlus, validateBody(createMessageSchema), createMessageHandler);

// ── Appointments ──────────────────────────────────────────────────────────────
v1.get   ("/appointments/upcoming",                          getUpcoming);
v1.get   ("/appointments/stats",                             getAppointmentStatsHandler);
v1.get   ("/appointments",                                   listAppointments);
v1.get   ("/appointments/:id",                               getAppointment);
v1.post  ("/appointments",    agentPlus, validateBody(createAppointmentSchema), createAppointmentHandler);
v1.patch ("/appointments/:id", agentPlus, validateBody(updateAppointmentSchema), updateAppointmentHandler);
v1.delete("/appointments/:id", adminPlus,                    deleteAppointmentHandler);

// ── Services ──────────────────────────────────────────────────────────────────
// Not one of agent's 4 CRM resources — same viewer-visible/agent-excluded
// shape as /business and /users.
v1.get   ("/services",        viewerOrAdminPlus,             listServices);
v1.get   ("/services/:id",    viewerOrAdminPlus,             getService);
v1.post  ("/services",        adminPlus, validateBody(createServiceSchema),  createServiceHandler);
v1.patch ("/services/:id",    adminPlus, validateBody(updateServiceSchema),  updateServiceHandler);
v1.delete("/services/:id",    adminPlus,                     deleteServiceHandler);

// ── Analytics ─────────────────────────────────────────────────────────────────
v1.get   ("/analytics",                                      getAnalytics);
v1.get   ("/analytics/timeline",                             getTimeline);
v1.get   ("/analytics/events",                               getEvents);

// ── Contact Requests ──────────────────────────────────────────────────────────
// POST is registered above, before v1.use(authenticate), and stays public.
v1.get   ("/contact-requests",                               listContactRequests);
v1.get   ("/contact-requests/:id",                           getContactRequest);
v1.patch ("/contact-requests/:id", agentPlus, validateBody(updateContactRequestSchema), updateContactRequestHandler);
v1.delete("/contact-requests/:id", adminPlus,                deleteContactRequestHandler);

// ── Widget Sessions ───────────────────────────────────────────────────────────
// Not one of agent's 4 CRM resources — writes are admin+ only.
v1.get   ("/widget-sessions",                                listWidgetSessions);
v1.post  ("/widget-sessions", adminPlus, validateBody(createWidgetSessionSchema), createWidgetSession);
v1.patch ("/widget-sessions/:id", adminPlus, validateBody(updateWidgetSessionSchema), updateWidgetSession);

// ── Operations (Phase I.7) ────────────────────────────────────────────────────
v1.use(operationsRouter);

export default v1;
