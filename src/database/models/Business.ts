import mongoose, { Schema, Document, Model } from "mongoose";

export type BusinessPlan = "free" | "starter" | "growth" | "enterprise";
export type BusinessStatus = "active" | "suspended" | "cancelled";

export interface IBusiness extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  plan: BusinessPlan;
  status: BusinessStatus;
  widgetEnabled: boolean;
  widgetConfig: {
    greeting: string;
    accentColor: string;
    position: "bottom-right" | "bottom-left";
    theme: "light" | "dark" | "auto";
  };
  billingEmail?: string;
  timezone: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name:          { type: String, required: true, trim: true, maxlength: 100 },
    slug:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:         { type: String, trim: true },
    website:       { type: String, trim: true },
    industry:      { type: String, trim: true },
    plan:          { type: String, enum: ["free","starter","growth","enterprise"], default: "free" },
    status:        { type: String, enum: ["active","suspended","cancelled"], default: "active" },
    widgetEnabled: { type: Boolean, default: true },
    widgetConfig: {
      greeting:    { type: String, default: "Hi! How can I help you today?" },
      accentColor: { type: String, default: "#2563EB" },
      position:    { type: String, enum: ["bottom-right","bottom-left"], default: "bottom-right" },
      theme:       { type: String, enum: ["light","dark","auto"], default: "auto" },
    },
    billingEmail:  { type: String, lowercase: true, trim: true },
    timezone:      { type: String, default: "America/New_York" },
    deletedAt:     { type: Date, default: null },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

BusinessSchema.index({ status: 1, plan: 1 });
BusinessSchema.index({ deletedAt: 1 });

export const Business: Model<IBusiness> = mongoose.models.Business ?? mongoose.model<IBusiness>("Business", BusinessSchema);
