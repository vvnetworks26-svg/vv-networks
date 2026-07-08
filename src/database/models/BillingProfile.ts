import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface IBillingProfile extends Document {
  businessId: Types.ObjectId;
  companyName?: string;
  vatNumber?: string;
  taxId?: string;
  billingEmail: string;
  defaultCurrency: string;
  defaultPaymentTermsDays: number;
  address?: IAddress;
  stripeCustomerId?: string;  // Phase I.6
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  line1:      { type: String, required: true },
  line2:      { type: String },
  city:       { type: String, required: true },
  state:      { type: String },
  postalCode: { type: String },
  country:    { type: String, required: true, default: "US" },
}, { _id: false });

const BillingProfileSchema = new Schema<IBillingProfile>(
  {
    businessId:              { type: Schema.Types.ObjectId, ref: "Business", required: true, unique: true },
    companyName:             { type: String, trim: true },
    vatNumber:               { type: String, trim: true },
    taxId:                   { type: String, trim: true },
    billingEmail:            { type: String, required: true, lowercase: true, trim: true },
    defaultCurrency:         { type: String, default: "USD", maxlength: 3 },
    defaultPaymentTermsDays: { type: Number, default: 30, min: 0 },
    address:                 { type: AddressSchema },
    stripeCustomerId:        { type: String },
  },
  { timestamps: true }
);

BillingProfileSchema.index({ stripeCustomerId: 1 }, { sparse: true });

export const BillingProfile: Model<IBillingProfile> =
  mongoose.models.BillingProfile ??
  mongoose.model<IBillingProfile>("BillingProfile", BillingProfileSchema);
