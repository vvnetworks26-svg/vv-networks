import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEmailVerificationToken extends Document {
  userId: Types.ObjectId;
  email: string;
  tokenHash: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true },
    isUsed:    { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export const EmailVerificationToken: Model<IEmailVerificationToken> =
  mongoose.models.EmailVerificationToken ??
  mongoose.model<IEmailVerificationToken>("EmailVerificationToken", EmailVerificationTokenSchema);
