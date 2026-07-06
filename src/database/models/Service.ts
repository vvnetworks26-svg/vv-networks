import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ServiceType = "leadflow" | "website" | "custom-software" | "ai-automation" | "tech-partner" | "consulting";
export type PricingModel = "monthly" | "one-time" | "milestone" | "custom";

export interface IService extends Document {
  businessId: Types.ObjectId;
  name: string;
  type: ServiceType;
  description?: string;
  pricingModel: PricingModel;
  basePrice?: number;
  currency: string;
  deliveryWeeksMin?: number;
  deliveryWeeksMax?: number;
  isActive: boolean;
  features: string[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    businessId:        { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name:              { type: String, required: true, trim: true, maxlength: 200 },
    type:              { type: String, enum: ["leadflow","website","custom-software","ai-automation","tech-partner","consulting"], required: true },
    description:       { type: String, maxlength: 2000 },
    pricingModel:      { type: String, enum: ["monthly","one-time","milestone","custom"], required: true },
    basePrice:         { type: Number, min: 0 },
    currency:          { type: String, default: "USD" },
    deliveryWeeksMin:  { type: Number, min: 1 },
    deliveryWeeksMax:  { type: Number, min: 1 },
    isActive:          { type: Boolean, default: true },
    features:          { type: [String], default: [] },
    deletedAt:         { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

ServiceSchema.index({ businessId: 1, type: 1 });
ServiceSchema.index({ businessId: 1, isActive: 1 });

export const Service: Model<IService> =
  mongoose.models.Service ?? mongoose.model<IService>("Service", ServiceSchema);
