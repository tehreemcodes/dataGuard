import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  policyId: string;
  datasetId: string;
  createdBy: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: Date;
  finishedAt?: Date;
  message?: string;
  encryptedOutputPath?: string;
  preview?: any[]; // small sample of masked rows
}

const JobSchema = new Schema<IJob>({
  policyId: { type: String, required: true },
  datasetId: { type: String, required: true },
  createdBy: { type: String, required: true },
  status: { type: String, default: "queued" },
  createdAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  message: { type: String },
  encryptedOutputPath: { type: String },
  preview: { type: Array }
});

export default mongoose.model<IJob>("Job", JobSchema);
