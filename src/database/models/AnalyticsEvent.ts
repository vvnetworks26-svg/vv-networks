import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AnalyticsEventName =
  | "widget:opened" | "widget:closed"
  | "conversation:started" | "conversation:completed"
  | "message:sent" | "message:received"
  | "qualification:updated" | "appointment:requested" | "lead:captured"
  | "demo:requested" | "page_view" | "cta_clicked"
  | "booking_started" | "booking_completed"
  | "contact_form_submitted";

export interface IAnalyticsEvent extends Document {
  businessId: Types.ObjectId;
  sessionId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    businessId:  { type: Schema.Types.ObjectId, ref: "Business", required: true },
    sessionId:   { type: Schema.Types.ObjectId, ref: "WidgetSession" },
    leadId:      { type: Schema.Types.ObjectId, ref: "Lead" },
    name:        { type: String, required: true },
    properties:  { type: Schema.Types.Mixed },
    ipAddress:   { type: String },
    userAgent:   { type: String },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ businessId: 1, name: 1, createdAt: -1 });
AnalyticsEventSchema.index({ businessId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ leadId: 1, name: 1 });

export const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ??
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
