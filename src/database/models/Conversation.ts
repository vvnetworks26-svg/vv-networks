import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ConversationStatus = "active" | "completed" | "abandoned" | "transferred";
export type ConversationChannel = "widget" | "whatsapp" | "email" | "sms";

export interface IConversation extends Document {
  businessId: Types.ObjectId;
  leadId?: Types.ObjectId;
  widgetSessionId?: Types.ObjectId;
  status: ConversationStatus;
  channel: ConversationChannel;
  messageCount: number;
  qualificationScore: number;
  summary?: string;
  completedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    businessId:      { type: Schema.Types.ObjectId, ref: "Business", required: true },
    leadId:          { type: Schema.Types.ObjectId, ref: "Lead" },
    widgetSessionId: { type: Schema.Types.ObjectId, ref: "WidgetSession" },
    status:          { type: String, enum: ["active","completed","abandoned","transferred"], default: "active" },
    channel:         { type: String, enum: ["widget","whatsapp","email","sms"], default: "widget" },
    messageCount:    { type: Number, default: 0 },
    qualificationScore: { type: Number, min: 0, max: 100, default: 0 },
    summary:         { type: String, maxlength: 1000 },
    completedAt:     { type: Date },
    deletedAt:       { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

ConversationSchema.index({ businessId: 1, status: 1 });
ConversationSchema.index({ businessId: 1, leadId: 1 });
ConversationSchema.index({ businessId: 1, createdAt: -1 });

export const Conversation: Model<IConversation> = mongoose.models.Conversation ?? mongoose.model<IConversation>("Conversation", ConversationSchema);
