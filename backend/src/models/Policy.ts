// backend/src/models/Policy.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPolicy extends Document {
  datasetId: string;
  policyName: string;
  fields: {
    name: string;
    maskType: string;
    generalizationLevel?: string;
    // optional role overrides:
    roleOverrides?: Record<string, { maskType?: string; generalizationLevel?: string }>;
  }[];
  k: number;
  l: number;
  epsilon: number;
  createdBy: string;
  createdAt: Date;

  // versioning
  version: number;
  versions?: {
    version: number;
    fields: any;
    k: number;
    l: number;
    epsilon: number;
    createdBy: string;
    createdAt: Date;
  }[];
}

const FieldSchema = new Schema({
  name: { type: String, required: true },
  maskType: { type: String, required: true },
  generalizationLevel: { type: String },
  roleOverrides: { type: Schema.Types.Mixed }
}, { _id: false });

const PolicySchema = new Schema<IPolicy>({
  datasetId: { type: String, required: true },
  policyName: { type: String, required: true },
  fields: [FieldSchema],
  k: { type: Number, required: true },
  l: { type: Number, required: true },
  epsilon: { type: Number, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  // versioning
  version: { type: Number, default: 1 },
  versions: [
    {
      version: { type: Number, required: true },
      fields: { type: Schema.Types.Mixed },
      k: { type: Number },
      l: { type: Number },
      epsilon: { type: Number },
      createdBy: { type: String },
      createdAt: { type: Date }
    }
  ]
});

export default mongoose.model<IPolicy>("Policy", PolicySchema);
