// backend/src/models/Dataset.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDataset extends Document {
  originalName: string;
  storedName: string;
  originalPath?: string;
  encryptedPath: string;
  size: number;
  mimetype: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: string;
  fields?: {
    name: string;
    type: string;
    sensitivity: string;
    maskType?: string;
    generalizationLevel?: string;
  }[];
}

const DatasetSchema = new Schema<IDataset>({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  originalPath: { type: String },
  encryptedPath: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, default: "uploaded" },
  fields: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
      sensitivity: { type: String, required: true },
      maskType: { type: String, default: "pseudonymize" },
      generalizationLevel: { type: String, default: "medium" }
    }
  ]
});

export default mongoose.model<IDataset>("Dataset", DatasetSchema);
