import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CouponType = "percentage" | "fixed";

export interface ICoupon extends Document {
  businessId:    Types.ObjectId;
  code:          string;
  type:          CouponType;
  value:         number;        // percent (0-100) or fixed amount
  currency:      string;        // only relevant for "fixed"
  description?:  string;
  maxUses?:      number;        // null = unlimited
  usedCount:     number;
  expiresAt?:    Date;
  isActive:      boolean;
  deletedAt?:    Date;
  createdAt:     Date;
  updatedAt:     Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    businessId:  { type: Schema.Types.ObjectId, ref: "Business", required: true },
    code:        { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    type:        { type: String, enum: ["percentage", "fixed"], required: true },
    value:       { type: Number, required: true, min: 0 },
    currency:    { type: String, default: "USD", maxlength: 3 },
    description: { type: String, maxlength: 500 },
    maxUses:     { type: Number, min: 1, default: null },
    usedCount:   { type: Number, default: 0, min: 0 },
    expiresAt:   { type: Date },
    isActive:    { type: Boolean, default: true },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

CouponSchema.index({ businessId: 1, code: 1 }, { unique: true });
CouponSchema.index({ businessId: 1, isActive: 1 });
CouponSchema.index({ expiresAt: 1 }, { sparse: true });

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon ?? mongoose.model<ICoupon>("Coupon", CouponSchema);
