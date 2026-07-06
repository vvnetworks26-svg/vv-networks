import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  businessId: Types.ObjectId;
  role: MessageRole;
  content: string;
  tokens?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    businessId:     { type: Schema.Types.ObjectId, ref: "Business", required: true },
    role:           { type: String, enum: ["user","assistant","system"], required: true },
    content:        { type: String, required: true, maxlength: 10000 },
    tokens:         { type: Number },
    metadata:       { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ businessId: 1, createdAt: -1 });

export const Message: Model<IMessage> = mongoose.models.Message ?? mongoose.model<IMessage>("Message", MessageSchema);
