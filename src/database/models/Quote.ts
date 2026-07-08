import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ILineItem } from "./Invoice.js";

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";

const LineItemSchema = new Schema<ILineItem>({
  description: { type: String, required: true },
  quantity:    { type: Number, required: true, min: 0 },
  unitPrice:   { type: Number, required: true, min: 0 },
  total:       { type: Number, required: true, min: 0 },
}, { _id: false });

export interface IQuote extends Document {
  businessId: Types.ObjectId;
  clientId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  lineItems: ILineItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  validUntil?: Date;
  notes?: string;
  terms?: string;
  sentAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  convertedInvoiceId?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    businessId:         { type: Schema.Types.ObjectId, ref: "Business", required: true },
    clientId:           { type: Schema.Types.ObjectId, ref: "Lead" },
    projectId:          { type: Schema.Types.ObjectId, ref: "Project" },
    quoteNumber:        { type: String, required: true, trim: true },
    title:              { type: String, required: true, trim: true, maxlength: 200 },
    status:             { type: String, enum: ["draft","sent","accepted","rejected","expired","converted"], default: "draft" },
    lineItems:          { type: [LineItemSchema], default: [] },
    subtotal:           { type: Number, required: true, min: 0 },
    discountPercent:    { type: Number, default: 0, min: 0, max: 100 },
    discountAmount:     { type: Number, default: 0, min: 0 },
    taxRate:            { type: Number, default: 0, min: 0, max: 100 },
    taxAmount:          { type: Number, default: 0, min: 0 },
    total:              { type: Number, required: true, min: 0 },
    currency:           { type: String, default: "USD", maxlength: 3 },
    validUntil:         { type: Date },
    notes:              { type: String, maxlength: 3000 },
    terms:              { type: String, maxlength: 3000 },
    sentAt:             { type: Date },
    acceptedAt:         { type: Date },
    rejectedAt:         { type: Date },
    convertedInvoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    deletedAt:          { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

QuoteSchema.index({ businessId: 1, status: 1 });
QuoteSchema.index({ businessId: 1, createdAt: -1 });
QuoteSchema.index({ businessId: 1, quoteNumber: 1 }, { unique: true });

export const Quote: Model<IQuote> =
  mongoose.models.Quote ?? mongoose.model<IQuote>("Quote", QuoteSchema);
