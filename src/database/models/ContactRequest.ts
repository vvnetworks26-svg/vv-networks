import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ContactRequestStatus = "new" | "reviewed" | "replied" | "archived";

export interface IContactRequest extends Document {
  businessId: Types.ObjectId;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  industry?: string;
  website?: string;
  projectType: string;
  budget?: string;
  timeline?: string;
  message: string;
  preferredContact: "email" | "phone" | "whatsapp";
  wantsLeadFlowDemo: boolean;
  status: ContactRequestStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>(
  {
    businessId:        { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name:              { type: String, required: true, trim: true, maxlength: 100 },
    email:             { type: String, required: true, lowercase: true, trim: true },
    company:           { type: String, trim: true },
    phone:             { type: String, trim: true },
    industry:          { type: String, trim: true },
    website:           { type: String, trim: true },
    projectType:       { type: String, required: true, trim: true },
    budget:            { type: String, trim: true },
    timeline:          { type: String, trim: true },
    message:           { type: String, required: true, maxlength: 5000 },
    preferredContact:  { type: String, enum: ["email","phone","whatsapp"], default: "email" },
    wantsLeadFlowDemo: { type: Boolean, default: false },
    status:            { type: String, enum: ["new","reviewed","replied","archived"], default: "new" },
    reviewedBy:        { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt:        { type: Date },
    deletedAt:         { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

ContactRequestSchema.index({ businessId: 1, status: 1 });
ContactRequestSchema.index({ businessId: 1, createdAt: -1 });
ContactRequestSchema.index({ email: 1 });

export const ContactRequest: Model<IContactRequest> =
  mongoose.models.ContactRequest ??
  mongoose.model<IContactRequest>("ContactRequest", ContactRequestSchema);
