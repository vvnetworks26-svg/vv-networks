import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AuditAction =
  | "auth.register" | "auth.login" | "auth.logout" | "auth.refresh"
  | "auth.password_reset_request" | "auth.password_reset_complete"
  | "auth.email_verify" | "auth.profile_update" | "auth.password_change"
  | "auth.token_reuse_detected" | "auth.login_failed"
  | "resource.create" | "resource.update" | "resource.delete" | "resource.restore";

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  businessId?: Types.ObjectId;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: "User" },
    businessId: { type: Schema.Types.ObjectId, ref: "Business" },
    action:     { type: String, required: true },
    resource:   { type: String },
    resourceId: { type: String },
    ipAddress:  { type: String },
    userAgent:  { type: String },
    meta:       { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ businessId: 1, action: 1, createdAt: -1 });
// Auto-purge after 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
