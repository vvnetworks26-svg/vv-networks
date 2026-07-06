/**
 * Ensures all Mongoose model indexes are synced to MongoDB Atlas.
 * Call once during application startup after connectDatabase().
 */
import { Business } from "./models/Business.js";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Conversation } from "./models/Conversation.js";
import { Message } from "./models/Message.js";
import { Appointment } from "./models/Appointment.js";
import { ContactRequest } from "./models/ContactRequest.js";
import { WidgetSession } from "./models/WidgetSession.js";
import { AnalyticsEvent } from "./models/AnalyticsEvent.js";
import { Project } from "./models/Project.js";
import { Invoice } from "./models/Invoice.js";
import { Service } from "./models/Service.js";

const MODELS = [
  Business, User, Lead, Conversation, Message,
  Appointment, ContactRequest, WidgetSession,
  AnalyticsEvent, Project, Invoice, Service,
];

export async function ensureIndexes(): Promise<void> {
  for (const model of MODELS) {
    await model.createIndexes();
  }
  console.info(`[MongoDB] Indexes ensured for ${MODELS.length} collections.`);
}
