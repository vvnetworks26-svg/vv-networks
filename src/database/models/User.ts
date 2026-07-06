import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "owner" | "admin" | "agent" | "viewer";

export interface IUser extends Document {
  businessId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    businessId:   { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name:         { type: String, required: true, trim: true, maxlength: 100 },
    email:        { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    role:         { type: String, enum: ["owner","admin","agent","viewer"], default: "agent" },
    avatarUrl:    { type: String },
    isActive:     { type: Boolean, default: true },
    lastLoginAt:  { type: Date },
    deletedAt:    { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

UserSchema.index({ businessId: 1, email: 1 }, { unique: true });
UserSchema.index({ businessId: 1, role: 1 });

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
