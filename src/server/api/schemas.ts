import { z } from "zod";

// ── Business ─────────────────────────────────────────────────────────────────
export const updateBusinessSchema = z.object({
  name:          z.string().min(1).max(100).optional(),
  phone:         z.string().optional(),
  website:       z.string().url().optional(),
  industry:      z.string().optional(),
  timezone:      z.string().optional(),
  billingEmail:  z.string().email().optional(),
  widgetEnabled: z.boolean().optional(),
  widgetConfig: z.object({
    greeting:    z.string().optional(),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    position:    z.enum(["bottom-right","bottom-left"]).optional(),
    theme:       z.enum(["light","dark","auto"]).optional(),
  }).optional(),
});

// ── User ─────────────────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  name:  z.string().min(1).max(100),
  email: z.string().email(),
  role:  z.enum(["owner","admin","agent","viewer"]).default("agent"),
});
export const updateUserSchema = createUserSchema.partial();

// ── Lead ─────────────────────────────────────────────────────────────────────
export const createLeadSchema = z.object({
  name:              z.string().min(1).max(100),
  email:             z.string().email(),
  phone:             z.string().optional(),
  company:           z.string().optional(),
  industry:          z.string().optional(),
  source:            z.enum(["widget","contact_form","manual","import","api"]).default("manual"),
  estimatedValue:    z.number().min(0).optional(),
  notes:             z.string().max(2000).optional(),
  tags:              z.array(z.string()).default([]),
  assignedTo:        z.string().optional(),
});
export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(["new","qualified","booked","won","lost","disqualified"]).optional(),
  qualificationScore: z.number().min(0).max(100).optional(),
});
export const leadSearchSchema = z.object({
  q:        z.string().optional(),
  status:   z.string().optional(),
  source:   z.string().optional(),
  industry: z.string().optional(),
  minScore: z.coerce.number().optional(),
  maxScore: z.coerce.number().optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  sort:     z.string().default("createdAt"),
  order:    z.enum(["asc","desc"]).default("desc"),
});

// ── Conversation ──────────────────────────────────────────────────────────────
export const createConversationSchema = z.object({
  leadId:  z.string().optional(),
  channel: z.enum(["widget","whatsapp","email","sms"]).default("widget"),
});
export const updateConversationSchema = z.object({
  status:             z.enum(["active","completed","abandoned","transferred"]).optional(),
  summary:            z.string().max(1000).optional(),
  qualificationScore: z.number().min(0).max(100).optional(),
});

// ── Message ───────────────────────────────────────────────────────────────────
export const createMessageSchema = z.object({
  role:    z.enum(["user","assistant","system"]),
  content: z.string().min(1).max(10000),
  tokens:  z.number().optional(),
});

// ── Appointment ───────────────────────────────────────────────────────────────
export const createAppointmentSchema = z.object({
  leadId:          z.string(),
  conversationId:  z.string().optional(),
  assignedTo:      z.string().optional(),
  scheduledAt:     z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(180).default(30),
  title:           z.string().min(1).max(200),
  notes:           z.string().max(2000).optional(),
  meetingUrl:      z.string().url().optional(),
});
export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  status: z.enum(["pending","confirmed","completed","cancelled","no_show"]).optional(),
  cancelReason: z.string().max(500).optional(),
});

// ── Contact Request ───────────────────────────────────────────────────────────
export const createContactRequestSchema = z.object({
  name:              z.string().min(1).max(100),
  email:             z.string().email(),
  company:           z.string().optional(),
  phone:             z.string().optional(),
  industry:          z.string().optional(),
  website:           z.string().optional(),
  projectType:       z.string().min(1),
  budget:            z.string().optional(),
  timeline:          z.string().optional(),
  message:           z.string().min(20).max(5000),
  preferredContact:  z.enum(["email","phone","whatsapp"]).default("email"),
  wantsLeadFlowDemo: z.boolean().default(false),
});
export const updateContactRequestSchema = z.object({
  status: z.enum(["new","reviewed","replied","archived"]).optional(),
});

// ── Project ───────────────────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  clientId:           z.string().optional(),
  managedBy:          z.string().optional(),
  name:               z.string().min(1).max(200),
  type:               z.enum(["leadflow","website","custom-software","ai-automation","tech-partner"]),
  description:        z.string().max(5000).optional(),
  totalValue:         z.number().min(0).default(0),
  startDate:          z.string().datetime().optional(),
  targetDeliveryDate: z.string().datetime().optional(),
  repoUrl:            z.string().url().optional(),
  notes:              z.string().optional(),
});
export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(["discovery","proposal","active","review","completed","paused","cancelled"]).optional(),
  paidValue: z.number().min(0).optional(),
});

// ── Invoice ───────────────────────────────────────────────────────────────────
export const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity:    z.number().min(0),
  unitPrice:   z.number().min(0),
  total:       z.number().min(0),
});
export const createInvoiceSchema = z.object({
  projectId: z.string().optional(),
  clientId:  z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1),
  taxRate:   z.number().min(0).max(100).default(0),
  currency:  z.string().length(3).default("USD"),
  issuedAt:  z.string().datetime().optional(),
  dueAt:     z.string().datetime().optional(),
  notes:     z.string().max(2000).optional(),
});
export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(["draft","sent","paid","overdue","cancelled"]).optional(),
  paidAt: z.string().datetime().optional(),
});

// ── Service ───────────────────────────────────────────────────────────────────
export const createServiceSchema = z.object({
  name:             z.string().min(1).max(200),
  type:             z.enum(["leadflow","website","custom-software","ai-automation","tech-partner","consulting"]),
  description:      z.string().max(2000).optional(),
  pricingModel:     z.enum(["monthly","one-time","milestone","custom"]),
  basePrice:        z.number().min(0).optional(),
  currency:         z.string().length(3).default("USD"),
  deliveryWeeksMin: z.number().int().min(1).optional(),
  deliveryWeeksMax: z.number().int().min(1).optional(),
  features:         z.array(z.string()).default([]),
});
export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ── Widget Session ────────────────────────────────────────────────────────────
export const createWidgetSessionSchema = z.object({
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  referrer:  z.string().optional(),
});
export const updateWidgetSessionSchema = z.object({
  leadId:             z.string().optional(),
  phase:              z.enum(["idle","greeting","qualifying","solution","booking","complete"]).optional(),
  qualificationScore: z.number().min(0).max(100).optional(),
  qualificationData:  z.record(z.string()).optional(),
  appointmentRequested: z.boolean().optional(),
});
