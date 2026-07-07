import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  tokenHash: string;
  family: string;          // rotation family — invalidates entire family on reuse
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: "User",     required: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    tokenHash:  { type: String, required: true, unique: true },
    family:     { type: String, required: true, index: true },
    isRevoked:  { type: Boolean, default: false },
    userAgent:  { type: String },
    ipAddress:  { type: String },
    expiresAt:  { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ family: 1, isRevoked: 1 });

export const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken ??
  mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
