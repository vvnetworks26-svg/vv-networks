import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SessionPhase = "idle" | "greeting" | "qualifying" | "solution" | "booking" | "complete";

export interface IWidgetSession extends Document {
  businessId: Types.ObjectId;
  leadId?: Types.ObjectId;
  sessionToken: string;
  phase: SessionPhase;
  qualificationScore: number;
  qualificationData: Record<string, string>;
  messageCount: number;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  appointmentRequested: boolean;
  completedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSessionSchema = new Schema<IWidgetSession>(
  {
    businessId:          { type: Schema.Types.ObjectId, ref: "Business", required: true },
    leadId:              { type: Schema.Types.ObjectId, ref: "Lead" },
    sessionToken:        { type: String, required: true, unique: true },
    phase:               { type: String, enum: ["idle","greeting","qualifying","solution","booking","complete"], default: "idle" },
    qualificationScore:  { type: Number, min: 0, max: 100, default: 0 },
    qualificationData:   { type: Schema.Types.Mixed, default: {} },
    messageCount:        { type: Number, default: 0 },
    ipAddress:           { type: String },
    userAgent:           { type: String },
    referrer:            { type: String },
    appointmentRequested:{ type: Boolean, default: false },
    completedAt:         { type: Date },
    expiresAt:           { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

WidgetSessionSchema.index({ businessId: 1, phase: 1 });
WidgetSessionSchema.index({ businessId: 1, createdAt: -1 });

export const WidgetSession: Model<IWidgetSession> =
  mongoose.models.WidgetSession ??
  mongoose.model<IWidgetSession>("WidgetSession", WidgetSessionSchema);
