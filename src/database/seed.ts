/**
 * Development seed — generates realistic data for local testing.
 * Run: tsx src/database/seed.ts
 * WARNING: Clears existing data before seeding.
 */
import mongoose from "mongoose";
import { config } from "../server/config.js";
import { Business } from "./models/Business.js";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Conversation } from "./models/Conversation.js";
import { Message } from "./models/Message.js";
import { Appointment } from "./models/Appointment.js";
import { AnalyticsEvent } from "./models/AnalyticsEvent.js";
import { Service } from "./models/Service.js";
import { Project } from "./models/Project.js";
import { Invoice } from "./models/Invoice.js";
import { ContactRequest } from "./models/ContactRequest.js";
import { WidgetSession } from "./models/WidgetSession.js";
import crypto from "crypto";

const INDUSTRIES = ["HVAC","Roofing","Legal","Real Estate","Medical","Restaurant","Construction","Plumbing","Landscaping","Electrical"];
const FIRST_NAMES = ["Sarah","Marcus","Elena","James","Priya","David","Linda","Robert","Jessica","Michael","Emma","Carlos","Aisha","Tom","Rachel"];
const LAST_NAMES  = ["Jenkins","Vance","Rostova","Cooper","Sharma","Brooks","Hayes","Kim","Patel","Torres","Chen","Williams","Johnson","Brown","Davis"];
const COMPANIES   = ["Peak Growth Services","Vance Premium Roofing","Nordic Luxury Lodges","Apex Legal Group","Summit Real Estate","Metro Medical","Blue Sky HVAC","First Choice Plumbing","Green Leaf Landscaping","Premier Construction"];

function rand<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(n: number): Date { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function futureDays(n: number): Date { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function randomName(): { first: string; last: string } {
  return { first: rand(FIRST_NAMES), last: rand(LAST_NAMES) };
}

async function seed(): Promise<void> {
  if (!config.mongoUri) {
    console.error("[Seed] MONGODB_URI not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);
  console.info("[Seed] Connected to MongoDB.");

  // Clear all collections
  await Promise.all([
    Business.deleteMany({}), User.deleteMany({}), Lead.deleteMany({}),
    Conversation.deleteMany({}), Message.deleteMany({}), Appointment.deleteMany({}),
    AnalyticsEvent.deleteMany({}), Service.deleteMany({}), Project.deleteMany({}),
    Invoice.deleteMany({}), ContactRequest.deleteMany({}), WidgetSession.deleteMany({}),
  ]);
  console.info("[Seed] Collections cleared.");

  // ── 1. Business ──────────────────────────────────────────────
  const business = await Business.create({
    name: "VV Networks",
    slug: "vv-networks",
    email: "vvnetworks26@gmail.com",
    phone: "+1 602 555 0100",
    website: "https://vvnetworks.io",
    industry: "AI Software",
    plan: "growth",
    status: "active",
    widgetEnabled: true,
    widgetConfig: { greeting: "Hi! I'm LeadFlow. How can I help your business today?", accentColor: "#2563EB", position: "bottom-right", theme: "auto" },
    timezone: "America/New_York",
  });
  console.info(`[Seed] Business: ${business.name}`);

  // ── 2. Users (3) ─────────────────────────────────────────────
  const users = await User.insertMany([
    { businessId: business._id, name: "Alex Vargas", email: "alex@vvnetworks.io", role: "owner", isActive: true },
    { businessId: business._id, name: "Jordan Smith", email: "jordan@vvnetworks.io", role: "admin", isActive: true },
    { businessId: business._id, name: "Riley Chen", email: "riley@vvnetworks.io", role: "agent", isActive: true },
  ]);
  console.info(`[Seed] Users: ${users.length}`);

  // ── 3. Services (4) ──────────────────────────────────────────
  await Service.insertMany([
    { businessId: business._id, name: "LeadFlow AI Widget", type: "leadflow", pricingModel: "monthly", basePrice: 299, deliveryWeeksMin: 2, deliveryWeeksMax: 3, isActive: true, features: ["AI qualification","Calendar booking","CRM sync","Dashboard"] },
    { businessId: business._id, name: "Growth Website", type: "website", pricingModel: "one-time", basePrice: 4500, deliveryWeeksMin: 3, deliveryWeeksMax: 4, isActive: true, features: ["Custom React build","LeadFlow integrated","Core Web Vitals 100","SEO"] },
    { businessId: business._id, name: "Custom Software", type: "custom-software", pricingModel: "milestone", basePrice: 8000, deliveryWeeksMin: 6, deliveryWeeksMax: 10, isActive: true, features: ["Architecture design","Custom dashboard","Integrations","Full IP transfer"] },
    { businessId: business._id, name: "AI Automation", type: "ai-automation", pricingModel: "custom", deliveryWeeksMin: 4, deliveryWeeksMax: 6, isActive: true, features: ["Workflow automation","CRM sync","Document processing","Custom AI agents"] },
  ]);

  // ── 4. Leads (50) ────────────────────────────────────────────
  const statuses = ["new","new","qualified","qualified","booked","booked","won","lost"] as const;
  const sources  = ["widget","widget","widget","contact_form","manual"] as const;

  const leadDocs = Array.from({ length: 50 }, (_, i) => {
    const { first, last } = randomName();
    return {
      businessId: business._id,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: `+1 602 555 ${String(1000 + i).slice(1)}`,
      company: rand(COMPANIES),
      industry: rand(INDUSTRIES),
      status: rand(statuses),
      source: rand(sources),
      qualificationScore: randInt(10, 100),
      estimatedValue: randInt(500, 15000),
      tags: [rand(INDUSTRIES).toLowerCase()],
    };
  });
  const leads = await Lead.insertMany(leadDocs);
  console.info(`[Seed] Leads: ${leads.length}`);

  // ── 5. Conversations (30) + Messages (500) ───────────────────
  let totalMessages = 0;
  const conversationInserts = [];
  const messageInserts: object[] = [];

  for (let i = 0; i < 30; i++) {
    const lead = leads[i % leads.length];
    const msgCount = randInt(5, 25);
    const conv = {
      businessId: business._id,
      leadId: lead._id,
      status: rand(["active","completed","completed","completed","abandoned"] as const),
      channel: "widget" as const,
      messageCount: msgCount,
      qualificationScore: randInt(20, 100),
      createdAt: daysAgo(randInt(0, 60)),
    };
    conversationInserts.push(conv);
    totalMessages += msgCount;
  }

  const conversations = await Conversation.insertMany(conversationInserts);

  const userMessages = ["Hi, I need help with my business.", "We're looking for AI automation.", "Can you tell me more about LeadFlow?", "What's the pricing?", "We have about 200 leads per month.", "Our budget is around $5K.", "We need this done ASAP.", "Can you integrate with HubSpot?", "How long does implementation take?", "I'd like to book a demo."];
  const assistantMessages = ["I'd be happy to help! What industry are you in?", "Great — tell me more about your current workflow.", "LeadFlow qualifies your leads 24/7 and books appointments automatically.", "Our plans start at $299/month. What's your lead volume?", "Perfect — LeadFlow handles up to 10,000 conversations per month.", "We can work within that budget. What's your timeline?", "We can have you live in 2-3 weeks.", "Yes — we integrate with HubSpot, Salesforce, and Zapier.", "Typically 2–3 weeks from kickoff.", "I'll connect you with our team right now!"];

  for (const conv of conversations) {
    const count = conv.messageCount;
    for (let m = 0; m < count; m++) {
      const isUser = m % 2 === 0;
      messageInserts.push({
        conversationId: conv._id,
        businessId: business._id,
        role: isUser ? "user" : "assistant",
        content: isUser ? rand(userMessages) : rand(assistantMessages),
        createdAt: new Date(conv.createdAt.getTime() + m * 30000),
      });
    }
  }
  await Message.insertMany(messageInserts);
  console.info(`[Seed] Conversations: ${conversations.length}, Messages: ${messageInserts.length}`);

  // ── 6. Appointments (10) ─────────────────────────────────────
  const aptStatuses = ["confirmed","confirmed","pending","completed","completed"] as const;
  const apptDocs = Array.from({ length: 10 }, (_, i) => ({
    businessId: business._id,
    leadId: leads[i]._id,
    assignedTo: users[i % users.length]._id,
    status: rand(aptStatuses),
    scheduledAt: i < 5 ? futureDays(randInt(1, 14)) : daysAgo(randInt(1, 30)),
    durationMinutes: 30,
    title: `Strategy Session — ${leads[i].name}`,
    notes: "Initial 30-minute discovery call.",
  }));
  await Appointment.insertMany(apptDocs);
  console.info("[Seed] Appointments: 10");

  // ── 7. Projects (3) ──────────────────────────────────────────
  const projects = await Project.insertMany([
    {
      businessId: business._id, clientId: leads[0]._id, managedBy: users[0]._id,
      name: "Peak Growth — LeadFlow Deployment", type: "leadflow", status: "active",
      totalValue: 4500, paidValue: 2250, startDate: daysAgo(14), targetDeliveryDate: futureDays(7),
      milestones: [
        { title: "Widget configuration", value: 1500, paid: true, completedAt: daysAgo(10) },
        { title: "Calendar integration", value: 1500, paid: true, completedAt: daysAgo(5) },
        { title: "Dashboard setup & training", value: 1500, paid: false, dueDate: futureDays(7) },
      ],
    },
    {
      businessId: business._id, clientId: leads[1]._id, managedBy: users[1]._id,
      name: "Vance Roofing — Custom CRM", type: "custom-software", status: "discovery",
      totalValue: 12000, paidValue: 0, startDate: daysAgo(3), targetDeliveryDate: futureDays(60),
      milestones: [
        { title: "Discovery & architecture", value: 3000, paid: false, dueDate: futureDays(7) },
        { title: "Development sprint 1", value: 4500, paid: false, dueDate: futureDays(35) },
        { title: "Testing & launch", value: 4500, paid: false, dueDate: futureDays(60) },
      ],
    },
    {
      businessId: business._id, clientId: leads[2]._id, managedBy: users[0]._id,
      name: "Nordic Lodges — Booking Assistant", type: "ai-automation", status: "completed",
      totalValue: 8500, paidValue: 8500, completedAt: daysAgo(20),
      milestones: [
        { title: "AI agent configuration", value: 3000, paid: true },
        { title: "Multi-lingual testing", value: 2500, paid: true },
        { title: "Production deployment", value: 3000, paid: true },
      ],
    },
  ]);
  console.info(`[Seed] Projects: ${projects.length}`);

  // ── 8. Invoices (4) ──────────────────────────────────────────
  await Invoice.insertMany([
    {
      businessId: business._id, projectId: projects[0]._id, clientId: leads[0]._id,
      invoiceNumber: "INV-0001", status: "paid",
      lineItems: [{ description: "LeadFlow setup — milestone 1 & 2", quantity: 1, unitPrice: 3000, total: 3000 }],
      subtotal: 3000, taxRate: 0, taxAmount: 0, total: 3000,
      issuedAt: daysAgo(12), dueAt: daysAgo(5), paidAt: daysAgo(4),
    },
    {
      businessId: business._id, projectId: projects[0]._id, clientId: leads[0]._id,
      invoiceNumber: "INV-0002", status: "sent",
      lineItems: [{ description: "LeadFlow setup — milestone 3 (dashboard & training)", quantity: 1, unitPrice: 1500, total: 1500 }],
      subtotal: 1500, taxRate: 0, taxAmount: 0, total: 1500,
      issuedAt: daysAgo(1), dueAt: futureDays(14),
    },
    {
      businessId: business._id, projectId: projects[2]._id, clientId: leads[2]._id,
      invoiceNumber: "INV-0003", status: "paid",
      lineItems: [{ description: "Nordic Lodges — full project", quantity: 1, unitPrice: 8500, total: 8500 }],
      subtotal: 8500, taxRate: 0, taxAmount: 0, total: 8500,
      issuedAt: daysAgo(25), dueAt: daysAgo(18), paidAt: daysAgo(20),
    },
    {
      businessId: business._id, projectId: projects[1]._id, clientId: leads[1]._id,
      invoiceNumber: "INV-0004", status: "draft",
      lineItems: [{ description: "Vance Roofing CRM — discovery phase", quantity: 1, unitPrice: 3000, total: 3000 }],
      subtotal: 3000, taxRate: 0, taxAmount: 0, total: 3000,
    },
  ]);
  console.info("[Seed] Invoices: 4");

  // ── 9. Analytics (90-day history) ────────────────────────────
  const events = ["widget:opened","conversation:started","message:sent","qualification:updated","lead:captured","appointment:requested","demo:requested","page_view","cta_clicked"] as const;
  const analyticsInserts = Array.from({ length: 270 }, (_, i) => ({
    businessId: business._id,
    name: rand(events),
    properties: { path: "/" },
    createdAt: daysAgo(Math.floor(i / 3)),
  }));
  await AnalyticsEvent.insertMany(analyticsInserts);
  console.info(`[Seed] Analytics events: ${analyticsInserts.length}`);

  // ── 10. Contact requests (5) ─────────────────────────────────
  const crDocs = Array.from({ length: 5 }, (_, i) => {
    const { first, last } = randomName();
    return {
      businessId: business._id,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}${i}@example.com`,
      company: rand(COMPANIES),
      industry: rand(INDUSTRIES),
      projectType: rand(["leadflow","website","custom-software","ai-automation"]),
      budget: rand(["under-5k","5k-15k","15k-50k"]),
      timeline: rand(["asap","1-3-months","3-6-months"]),
      message: "We're looking for a premium AI solution to automate our lead qualification process.",
      preferredContact: rand(["email","phone"] as const),
      wantsLeadFlowDemo: i % 2 === 0,
      status: rand(["new","reviewed","replied"] as const),
    };
  });
  await ContactRequest.insertMany(crDocs);
  console.info("[Seed] Contact requests: 5");

  // ── 11. Widget sessions (10) ──────────────────────────────────
  const sessionDocs = Array.from({ length: 10 }, (_, i) => ({
    businessId: business._id,
    leadId: i < 6 ? leads[i]._id : undefined,
    sessionToken: crypto.randomUUID(),
    phase: rand(["qualifying","solution","booking","complete"] as const),
    qualificationScore: randInt(20, 100),
    messageCount: randInt(3, 15),
    appointmentRequested: i < 4,
    expiresAt: futureDays(1),
    createdAt: daysAgo(randInt(0, 7)),
  }));
  await WidgetSession.insertMany(sessionDocs);
  console.info("[Seed] Widget sessions: 10");

  console.info("\n✅ Seed complete.");
  console.info(`   Business: 1  |  Users: ${users.length}  |  Leads: ${leads.length}`);
  console.info(`   Conversations: ${conversations.length}  |  Messages: ${messageInserts.length}`);
  console.info(`   Appointments: 10  |  Projects: ${projects.length}  |  Invoices: 4`);
  console.info(`   Analytics events: ${analyticsInserts.length}  |  Contact requests: 5  |  Widget sessions: 10`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Fatal error:", err);
  process.exit(1);
});
