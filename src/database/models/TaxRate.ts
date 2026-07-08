import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITaxRate extends Document {
  businessId:   Types.ObjectId;
  name:         string;        // e.g. "US Sales Tax", "VAT"
  rate:         number;        // percentage, e.g. 8.5
  country?:     string;        // ISO 3166-1 alpha-2, e.g. "US"
  state?:       string;        // e.g. "CA"
  description?: string;
  isDefault:    boolean;
  isActive:     boolean;
  deletedAt?:   Date;
  createdAt:    Date;
  updatedAt:    Date;
}

const TaxRateSchema = new Schema<ITaxRate>(
  {
    businessId:  { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    rate:        { type: Number, required: true, min: 0, max: 100 },
    country:     { type: String, trim: true, maxlength: 2 },
    state:       { type: String, trim: true, maxlength: 50 },
    description: { type: String, maxlength: 500 },
    isDefault:   { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

TaxRateSchema.index({ businessId: 1, isActive: 1 });
TaxRateSchema.index({ businessId: 1, country: 1 });
TaxRateSchema.index({ businessId: 1, isDefault: 1 });

export const TaxRate: Model<ITaxRate> =
  mongoose.models.TaxRate ?? mongoose.model<ITaxRate>("TaxRate", TaxRateSchema);
