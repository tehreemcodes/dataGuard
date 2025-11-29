import mongoose, { Schema, Document } from "mongoose";

export interface IPolicy extends Document {
  datasetId: string;
  policyName: string;
  fields: {
    name: string;
    maskType: string; // pseudonymize, generalize, suppress, tokenize
    generalizationLevel?: string;
  }[];
  k: number;
  l: number;
  epsilon: number;
  createdBy: string;
  createdAt: Date;
}

const PolicySchema = new Schema<IPolicy>({
  datasetId: { type: String, required: true },
  policyName: { type: String, required: true },
  fields: [
    {
      name: { type: String, required: true },
      maskType: { type: String, required: true },
      generalizationLevel: { type: String }
    }
  ],
  k: { type: Number, required: true },
  l: { type: Number, required: true },
  epsilon: { type: Number, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPolicy>("Policy", PolicySchema);
