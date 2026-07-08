import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PaymentMethodType = "card" | "bank_transfer" | "paypal" | "check" | "crypto" | "other";

export interface IPaymentMethod extends Document {
  businessId:       Types.ObjectId;
  clientId?:        Types.ObjectId;
  type:             PaymentMethodType;
  label:            string;        // display name, e.g. "Visa ending 4242"
  isDefault:        boolean;
  // Stripe future-ready fields
  stripePaymentMethodId?: string;
  // Masked details for display
  last4?:           string;
  brand?:           string;        // "visa", "mastercard", etc.
  expiryMonth?:     number;
  expiryYear?:      number;
  // Bank transfer
  bankName?:        string;
  accountLast4?:    string;
  metadata?:        Record<string, unknown>;
  isActive:         boolean;
  deletedAt?:       Date;
  createdAt:        Date;
  updatedAt:        Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    businessId:             { type: Schema.Types.ObjectId, ref: "Business", required: true },
    clientId:               { type: Schema.Types.ObjectId, ref: "Lead" },
    type:                   { type: String, enum: ["card","bank_transfer","paypal","check","crypto","other"], required: true },
    label:                  { type: String, required: true, trim: true, maxlength: 200 },
    isDefault:              { type: Boolean, default: false },
    stripePaymentMethodId:  { type: String },
    last4:                  { type: String, maxlength: 4 },
    brand:                  { type: String },
    expiryMonth:            { type: Number, min: 1, max: 12 },
    expiryYear:             { type: Number },
    bankName:               { type: String },
    accountLast4:           { type: String, maxlength: 4 },
    metadata:               { type: Schema.Types.Mixed },
    isActive:               { type: Boolean, default: true },
    deletedAt:              { type: Date, default: null },
  },
  { timestamps: true }
);

PaymentMethodSchema.index({ businessId: 1, isActive: 1 });
PaymentMethodSchema.index({ clientId: 1 });
PaymentMethodSchema.index({ stripePaymentMethodId: 1 }, { sparse: true });

export const PaymentMethod: Model<IPaymentMethod> =
  mongoose.models.PaymentMethod ??
  mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);
