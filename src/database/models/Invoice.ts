import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  businessId: Types.ObjectId;
  projectId?: Types.ObjectId;
  clientId?: Types.ObjectId;
  invoiceNumber: string;
  status: InvoiceStatus;
  lineItems: ILineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  issuedAt?: Date;
  dueAt?: Date;
  paidAt?: Date;
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<ILineItem>({
  description: { type: String, required: true },
  quantity:    { type: Number, required: true, min: 0 },
  unitPrice:   { type: Number, required: true, min: 0 },
  total:       { type: Number, required: true, min: 0 },
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>(
  {
    businessId:    { type: Schema.Types.ObjectId, ref: "Business", required: true },
    projectId:     { type: Schema.Types.ObjectId, ref: "Project" },
    clientId:      { type: Schema.Types.ObjectId, ref: "Lead" },
    invoiceNumber: { type: String, required: true, trim: true },
    status:        { type: String, enum: ["draft","sent","paid","overdue","cancelled"], default: "draft" },
    lineItems:     { type: [LineItemSchema], default: [] },
    subtotal:      { type: Number, required: true, min: 0 },
    taxRate:       { type: Number, default: 0, min: 0, max: 100 },
    taxAmount:     { type: Number, default: 0, min: 0 },
    total:         { type: Number, required: true, min: 0 },
    currency:      { type: String, default: "USD", maxlength: 3 },
    issuedAt:      { type: Date },
    dueAt:         { type: Date },
    paidAt:        { type: Date },
    notes:         { type: String, maxlength: 2000 },
    deletedAt:     { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

InvoiceSchema.index({ businessId: 1, status: 1 });
InvoiceSchema.index({ businessId: 1, createdAt: -1 });
InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice ?? mongoose.model<IInvoice>("Invoice", InvoiceSchema);
