import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SubscriptionStatus   = "trialing" | "active" | "paused" | "grace_period" | "cancelled" | "expired";
export type SubscriptionInterval = "monthly" | "quarterly" | "annual";

export interface ISubscription extends Document {
  businessId:          Types.ObjectId;
  clientId?:           Types.ObjectId;
  serviceId?:          Types.ObjectId;
  name:                string;
  status:              SubscriptionStatus;
  interval:            SubscriptionInterval;
  amount:              number;
  currency:            string;
  trialEndsAt?:        Date;
  currentPeriodStart:  Date;
  currentPeriodEnd:    Date;
  cancelledAt?:        Date;
  cancelAtPeriodEnd:   boolean;
  gracePeriodEndsAt?:  Date;
  couponId?:           Types.ObjectId;
  discountAmount:      number;
  stripeSubId?:        string;   // Phase I.6
  stripeCustomerId?:   string;   // Phase I.6
  metadata?:           Record<string, unknown>;
  deletedAt?:          Date;
  createdAt:           Date;
  updatedAt:           Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    businessId:         { type: Schema.Types.ObjectId, ref: "Business", required: true },
    clientId:           { type: Schema.Types.ObjectId, ref: "Lead" },
    serviceId:          { type: Schema.Types.ObjectId, ref: "Service" },
    name:               { type: String, required: true, trim: true, maxlength: 200 },
    status:             { type: String, enum: ["trialing","active","paused","grace_period","cancelled","expired"], default: "active" },
    interval:           { type: String, enum: ["monthly","quarterly","annual"], required: true },
    amount:             { type: Number, required: true, min: 0 },
    currency:           { type: String, default: "USD", maxlength: 3 },
    trialEndsAt:        { type: Date },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd:   { type: Date, required: true },
    cancelledAt:        { type: Date },
    cancelAtPeriodEnd:  { type: Boolean, default: false },
    gracePeriodEndsAt:  { type: Date },
    couponId:           { type: Schema.Types.ObjectId, ref: "Coupon" },
    discountAmount:     { type: Number, default: 0, min: 0 },
    stripeSubId:        { type: String },
    stripeCustomerId:   { type: String },
    metadata:           { type: Schema.Types.Mixed },
    deletedAt:          { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

SubscriptionSchema.index({ businessId: 1, status: 1 });
SubscriptionSchema.index({ businessId: 1, currentPeriodEnd: 1 });
SubscriptionSchema.index({ clientId: 1 });
SubscriptionSchema.index({ stripeSubId: 1 }, { sparse: true });

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ??
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
