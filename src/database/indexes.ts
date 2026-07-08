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
import { RefreshToken } from "./models/RefreshToken.js";
import { PasswordResetToken } from "./models/PasswordResetToken.js";
import { EmailVerificationToken } from "./models/EmailVerificationToken.js";
import { AuditLog } from "./models/AuditLog.js";
// Phase I.5 — Billing
import { BillingProfile } from "./models/BillingProfile.js";
import { Quote } from "./models/Quote.js";
import { Payment } from "./models/Payment.js";
import { Subscription } from "./models/Subscription.js";
import { Coupon } from "./models/Coupon.js";
import { TaxRate } from "./models/TaxRate.js";
import { PaymentMethod } from "./models/PaymentMethod.js";

const MODELS = [
  Business, User, Lead, Conversation, Message,
  Appointment, ContactRequest, WidgetSession,
  AnalyticsEvent, Project, Invoice, Service,
  RefreshToken, PasswordResetToken, EmailVerificationToken, AuditLog,
  // Billing
  BillingProfile, Quote, Payment, Subscription, Coupon, TaxRate, PaymentMethod,
];

export async function ensureIndexes(): Promise<void> {
  for (const model of MODELS) {
    await model.createIndexes();
  }
  console.info(`[MongoDB] Indexes ensured for ${MODELS.length} collections.`);
}
