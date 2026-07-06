import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type LeadStatus = "new" | "qualified" | "booked" | "won" | "lost" | "disqualified";
export type LeadSource = "widget" | "contact_form" | "manual" | "import" | "api";

export interface ILead extends Document {
  businessId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  status: LeadStatus;
  source: LeadSource;
  qualificationScore: number;
  qualificationData: Record<string, string>;
  estimatedValue?: number;
  assignedTo?: Types.ObjectId;
  notes?: string;
  tags: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    businessId:        { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name:              { type: String, required: true, trim: true, maxlength: 100 },
    email:             { type: String, required: true, lowercase: true, trim: true },
    phone:             { type: String, trim: true },
    company:           { type: String, trim: true },
    industry:          { type: String, trim: true },
    status:            { type: String, enum: ["new","qualified","booked","won","lost","disqualified"], default: "new" },
    source:            { type: String, enum: ["widget","contact_form","manual","import","api"], default: "widget" },
    qualificationScore:{ type: Number, min: 0, max: 100, default: 0 },
    qualificationData: { type: Schema.Types.Mixed, default: {} },
    estimatedValue:    { type: Number, min: 0 },
    assignedTo:        { type: Schema.Types.ObjectId, ref: "User" },
    notes:             { type: String, maxlength: 2000 },
    tags:              { type: [String], default: [] },
    deletedAt:         { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

LeadSchema.index({ businessId: 1, status: 1 });
LeadSchema.index({ businessId: 1, email: 1 });
LeadSchema.index({ businessId: 1, createdAt: -1 });
LeadSchema.index({ businessId: 1, qualificationScore: -1 });
LeadSchema.index({ deletedAt: 1 });

export const Lead: Model<ILead> = mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);
