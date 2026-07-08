import { Router } from "express";
import { withBusiness } from "../middleware.js";
import { validateBody, validateQuery } from "../validate.js";
import billingRouter from "./billing.js";
import operationsRouter from "./operations.js";

// Schemas
import {
  updateBusinessSchema,
  createUserSchema, updateUserSchema,
  createLeadSchema, updateLeadSchema, leadSearchSchema,
  createConversationSchema, updateConversationSchema, createMessageSchema,
  createAppointmentSchema, updateAppointmentSchema,
  createContactRequestSchema, updateContactRequestSchema,
  createProjectSchema, updateProjectSchema,
  createInvoiceSchema, updateInvoiceSchema,
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
  listProjects, getProject, createProjectHandler, updateProjectHandler,
  deleteProjectHandler, restoreProjectHandler, getProjectStatsHandler,
} from "../controllers/projects.controller.js";
import {
  listInvoices, getInvoice, createInvoiceHandler, updateInvoiceHandler,
  deleteInvoiceHandler, listOverdueInvoices,
} from "../controllers/invoices.controller.js";
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

// All v1 routes require business context
v1.use(withBusiness);

// ── Business ──────────────────────────────────────────────────────────────────
v1.get   ("/business",                                       getBusinessHandler);
v1.patch ("/business",        validateBody(updateBusinessSchema), updateBusinessHandler);

// ── Users ────────────────────────────────────────────────────────────────────
v1.get   ("/users",                                          listUsers);
v1.get   ("/users/:id",                                      getUser);
v1.post  ("/users",           validateBody(createUserSchema),    createUser);
v1.patch ("/users/:id",       validateBody(updateUserSchema),    updateUser);
v1.delete("/users/:id",                                      deleteUser);

// ── Leads ────────────────────────────────────────────────────────────────────
v1.get   ("/leads/stats",                                    getLeadStatsHandler);
v1.get   ("/leads/search",    validateQuery(leadSearchSchema),   searchLeadsHandler);
v1.get   ("/leads",                                          listLeads);
v1.get   ("/leads/:id",                                      getLead);
v1.post  ("/leads",           validateBody(createLeadSchema),    createLeadHandler);
v1.patch ("/leads/:id",       validateBody(updateLeadSchema),    updateLeadHandler);
v1.delete("/leads/:id",                                      deleteLeadHandler);
v1.post  ("/leads/:id/restore",                              restoreLeadHandler);

// ── Conversations ─────────────────────────────────────────────────────────────
v1.get   ("/conversations/stats",                            getConversationStatsHandler);
v1.get   ("/conversations",                                  listConversations);
v1.get   ("/conversations/:id",                              getConversation);
v1.post  ("/conversations",   validateBody(createConversationSchema), createConversationHandler);
v1.patch ("/conversations/:id", validateBody(updateConversationSchema), updateConversationHandler);
v1.delete("/conversations/:id",                              deleteConversationHandler);
v1.get   ("/conversations/:id/messages",                     listMessages);
v1.post  ("/conversations/:id/messages", validateBody(createMessageSchema), createMessageHandler);

// ── Appointments ──────────────────────────────────────────────────────────────
v1.get   ("/appointments/upcoming",                          getUpcoming);
v1.get   ("/appointments/stats",                             getAppointmentStatsHandler);
v1.get   ("/appointments",                                   listAppointments);
v1.get   ("/appointments/:id",                               getAppointment);
v1.post  ("/appointments",    validateBody(createAppointmentSchema), createAppointmentHandler);
v1.patch ("/appointments/:id", validateBody(updateAppointmentSchema), updateAppointmentHandler);
v1.delete("/appointments/:id",                               deleteAppointmentHandler);

// ── Projects ──────────────────────────────────────────────────────────────────
v1.get   ("/projects/stats",                                 getProjectStatsHandler);
v1.get   ("/projects",                                       listProjects);
v1.get   ("/projects/:id",                                   getProject);
v1.post  ("/projects",        validateBody(createProjectSchema),  createProjectHandler);
v1.patch ("/projects/:id",    validateBody(updateProjectSchema),  updateProjectHandler);
v1.delete("/projects/:id",                                   deleteProjectHandler);
v1.post  ("/projects/:id/restore",                           restoreProjectHandler);

// ── Invoices ──────────────────────────────────────────────────────────────────
v1.get   ("/invoices/overdue",                               listOverdueInvoices);
v1.get   ("/invoices",                                       listInvoices);
v1.get   ("/invoices/:id",                                   getInvoice);
v1.post  ("/invoices",        validateBody(createInvoiceSchema),  createInvoiceHandler);
v1.patch ("/invoices/:id",    validateBody(updateInvoiceSchema),  updateInvoiceHandler);
v1.delete("/invoices/:id",                                   deleteInvoiceHandler);

// ── Services ──────────────────────────────────────────────────────────────────
v1.get   ("/services",                                       listServices);
v1.get   ("/services/:id",                                   getService);
v1.post  ("/services",        validateBody(createServiceSchema),  createServiceHandler);
v1.patch ("/services/:id",    validateBody(updateServiceSchema),  updateServiceHandler);
v1.delete("/services/:id",                                   deleteServiceHandler);

// ── Analytics ─────────────────────────────────────────────────────────────────
v1.get   ("/analytics",                                      getAnalytics);
v1.get   ("/analytics/timeline",                             getTimeline);
v1.get   ("/analytics/events",                               getEvents);

// ── Contact Requests ──────────────────────────────────────────────────────────
v1.get   ("/contact-requests",                               listContactRequests);
v1.get   ("/contact-requests/:id",                           getContactRequest);
v1.post  ("/contact-requests", validateBody(createContactRequestSchema), createContactRequestHandler);
v1.patch ("/contact-requests/:id", validateBody(updateContactRequestSchema), updateContactRequestHandler);
v1.delete("/contact-requests/:id",                           deleteContactRequestHandler);

// ── Widget Sessions ───────────────────────────────────────────────────────────
v1.get   ("/widget-sessions",                                listWidgetSessions);
v1.post  ("/widget-sessions", validateBody(createWidgetSessionSchema), createWidgetSession);
v1.patch ("/widget-sessions/:id", validateBody(updateWidgetSessionSchema), updateWidgetSession);

// ── Billing (Phase I.5) ───────────────────────────────────────────────────────
v1.use(billingRouter);

// ── Operations (Phase I.7) ────────────────────────────────────────────────────
v1.use(operationsRouter);

export default v1;
