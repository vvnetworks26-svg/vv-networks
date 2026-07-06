import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ProjectStatus = "discovery" | "proposal" | "active" | "review" | "completed" | "paused" | "cancelled";
export type ProjectType = "leadflow" | "website" | "custom-software" | "ai-automation" | "tech-partner";

export interface IMilestone {
  title: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date;
  value: number;
  paid: boolean;
}

export interface IProject extends Document {
  businessId: Types.ObjectId;
  clientId?: Types.ObjectId;
  managedBy?: Types.ObjectId;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description?: string;
  totalValue: number;
  paidValue: number;
  milestones: IMilestone[];
  startDate?: Date;
  targetDeliveryDate?: Date;
  completedAt?: Date;
  repoUrl?: string;
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  dueDate:     { type: Date },
  completedAt: { type: Date },
  value:       { type: Number, required: true, min: 0 },
  paid:        { type: Boolean, default: false },
}, { _id: true });

const ProjectSchema = new Schema<IProject>(
  {
    businessId:          { type: Schema.Types.ObjectId, ref: "Business", required: true },
    clientId:            { type: Schema.Types.ObjectId, ref: "Lead" },
    managedBy:           { type: Schema.Types.ObjectId, ref: "User" },
    name:                { type: String, required: true, trim: true, maxlength: 200 },
    type:                { type: String, enum: ["leadflow","website","custom-software","ai-automation","tech-partner"], required: true },
    status:              { type: String, enum: ["discovery","proposal","active","review","completed","paused","cancelled"], default: "discovery" },
    description:         { type: String, maxlength: 5000 },
    totalValue:          { type: Number, default: 0, min: 0 },
    paidValue:           { type: Number, default: 0, min: 0 },
    milestones:          { type: [MilestoneSchema], default: [] },
    startDate:           { type: Date },
    targetDeliveryDate:  { type: Date },
    completedAt:         { type: Date },
    repoUrl:             { type: String },
    notes:               { type: String },
    deletedAt:           { type: Date, default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

ProjectSchema.index({ businessId: 1, status: 1 });
ProjectSchema.index({ businessId: 1, createdAt: -1 });
ProjectSchema.index({ managedBy: 1, status: 1 });

export const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", ProjectSchema);
