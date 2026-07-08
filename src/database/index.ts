// Connection
export { connectDatabase, disconnectDatabase, isDatabaseConnected, databaseHealthCheck } from "./connection.js";

// Indexes
export { ensureIndexes } from "./indexes.js";

// Models
export { Business } from "./models/Business.js";
export { User } from "./models/User.js";
export { Lead } from "./models/Lead.js";
export { Conversation } from "./models/Conversation.js";
export { Message } from "./models/Message.js";
export { Appointment } from "./models/Appointment.js";
export { ContactRequest } from "./models/ContactRequest.js";
export { WidgetSession } from "./models/WidgetSession.js";
export { AnalyticsEvent } from "./models/AnalyticsEvent.js";
export { Project } from "./models/Project.js";
export { Invoice } from "./models/Invoice.js";
export { Service } from "./models/Service.js";
// Phase I.5 — Billing
export { BillingProfile } from "./models/BillingProfile.js";
export { Quote } from "./models/Quote.js";
export { Payment } from "./models/Payment.js";
export { Subscription } from "./models/Subscription.js";
export { Coupon } from "./models/Coupon.js";
export { TaxRate } from "./models/TaxRate.js";
export { PaymentMethod } from "./models/PaymentMethod.js";

// Repositories
export { businessRepository } from "./repositories/BusinessRepository.js";
export { userRepository } from "./repositories/UserRepository.js";
export { leadRepository } from "./repositories/LeadRepository.js";
export { conversationRepository } from "./repositories/ConversationRepository.js";
export { messageRepository } from "./repositories/MessageRepository.js";
export { appointmentRepository } from "./repositories/AppointmentRepository.js";
export { contactRequestRepository } from "./repositories/ContactRequestRepository.js";
export { widgetSessionRepository } from "./repositories/WidgetSessionRepository.js";
export { analyticsRepository } from "./repositories/AnalyticsRepository.js";
export { projectRepository } from "./repositories/ProjectRepository.js";
export { invoiceRepository } from "./repositories/InvoiceRepository.js";
export { serviceRepository } from "./repositories/ServiceRepository.js";
// Phase I.5 — Billing
export { billingProfileRepository } from "./repositories/BillingProfileRepository.js";
export { quoteRepository } from "./repositories/QuoteRepository.js";
export { paymentRepository } from "./repositories/PaymentRepository.js";
export { subscriptionRepository } from "./repositories/SubscriptionRepository.js";
export { couponRepository } from "./repositories/CouponRepository.js";
export { taxRateRepository } from "./repositories/TaxRateRepository.js";
export { paymentMethodRepository } from "./repositories/PaymentMethodRepository.js";

// Types
export type { IBusiness, BusinessPlan, BusinessStatus } from "./models/Business.js";
export type { IUser, UserRole } from "./models/User.js";
export type { ILead, LeadStatus, LeadSource } from "./models/Lead.js";
export type { IConversation, ConversationStatus } from "./models/Conversation.js";
export type { IMessage, MessageRole } from "./models/Message.js";
export type { IAppointment, AppointmentStatus } from "./models/Appointment.js";
export type { IContactRequest, ContactRequestStatus } from "./models/ContactRequest.js";
export type { IWidgetSession, SessionPhase } from "./models/WidgetSession.js";
export type { IAnalyticsEvent, AnalyticsEventName } from "./models/AnalyticsEvent.js";
export type { IProject, ProjectStatus, ProjectType } from "./models/Project.js";
export type { IInvoice, InvoiceStatus } from "./models/Invoice.js";
export type { IService, ServiceType, PricingModel } from "./models/Service.js";
// Phase I.5 — Billing
export type { IBillingProfile } from "./models/BillingProfile.js";
export type { IQuote, QuoteStatus } from "./models/Quote.js";
export type { IPayment, PaymentStatus, PaymentProvider } from "./models/Payment.js";
export type { ISubscription, SubscriptionStatus, SubscriptionInterval } from "./models/Subscription.js";
export type { ICoupon, CouponType } from "./models/Coupon.js";
export type { ITaxRate } from "./models/TaxRate.js";
export type { IPaymentMethod, PaymentMethodType } from "./models/PaymentMethod.js";
