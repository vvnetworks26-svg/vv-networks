import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PaymentStatus  = "pending" | "succeeded" | "failed" | "refunded" | "partial_refund";
export type PaymentProvider = "stripe" | "manual" | "mock";

export interface IPayment extends Document {
  businessId:      Types.ObjectId;
  invoiceId?:      Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  clientId?:       Types.ObjectId;
  provider:        PaymentProvider;
  providerTxId?:   string;
  amount:          number;
  currency:        string;
  fees:            number;
  status:          PaymentStatus;
  refundedAmount:  number;
  description?:    string;
  metadata?:       Record<string, unknown>;
  failureReason?:  string;
  paidAt?:         Date;
  deletedAt?:      Date;
  createdAt:       Date;
  updatedAt:       Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    businessId:     { type: Schema.Types.ObjectId, ref: "Business", required: true },
    invoiceId:      { type: Schema.Types.ObjectId, ref: "Invoice" },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
    clientId:       { type: Schema.Types.ObjectId, ref: "Lead" },
    provider:       { type: String, enum: ["stripe","manual","mock"], required: true, default: "manual" },
    providerTxId:   { type: String, trim: true },
    amount:         { type: Number, required: true, min: 0 },
    currency:       { type: String, default: "USD", maxlength: 3 },
    fees:           { type: Number, default: 0, min: 0 },
    status:         { type: String, enum: ["pending","succeeded","failed","refunded","partial_refund"], default: "pending" },
    refundedAmount: { type: Number, default: 0, min: 0 },
    description:    { type: String, maxlength: 500 },
    metadata:       { type: Schema.Types.Mixed },
    failureReason:  { type: String },
    paidAt:         { type: Date },
    deletedAt:      { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

PaymentSchema.index({ businessId: 1, status: 1 });
PaymentSchema.index({ businessId: 1, createdAt: -1 });
PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ providerTxId: 1 }, { sparse: true });

export const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", PaymentSchema);
