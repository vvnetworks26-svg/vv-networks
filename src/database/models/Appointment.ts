import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface IAppointment extends Document {
  businessId: Types.ObjectId;
  leadId: Types.ObjectId;
  conversationId?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  status: AppointmentStatus;
  scheduledAt: Date;
  durationMinutes: number;
  title: string;
  notes?: string;
  meetingUrl?: string;
  reminderSentAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    businessId:      { type: Schema.Types.ObjectId, ref: "Business", required: true },
    leadId:          { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    conversationId:  { type: Schema.Types.ObjectId, ref: "Conversation" },
    assignedTo:      { type: Schema.Types.ObjectId, ref: "User" },
    status:          { type: String, enum: ["pending","confirmed","completed","cancelled","no_show"], default: "pending" },
    scheduledAt:     { type: Date, required: true },
    durationMinutes: { type: Number, default: 30, min: 15, max: 180 },
    title:           { type: String, required: true, trim: true, maxlength: 200 },
    notes:           { type: String, maxlength: 2000 },
    meetingUrl:      { type: String },
    reminderSentAt:  { type: Date },
    cancelledAt:     { type: Date },
    cancelReason:    { type: String, maxlength: 500 },
    deletedAt:       { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

AppointmentSchema.index({ businessId: 1, scheduledAt: 1 });
AppointmentSchema.index({ businessId: 1, status: 1 });
AppointmentSchema.index({ leadId: 1 });
AppointmentSchema.index({ assignedTo: 1, scheduledAt: 1 });

export const Appointment: Model<IAppointment> = mongoose.models.Appointment ?? mongoose.model<IAppointment>("Appointment", AppointmentSchema);
