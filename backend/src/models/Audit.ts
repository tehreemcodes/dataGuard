// backend/src/models/Audit.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAudit extends Document {
  userId?: string;
  userEmail?: string;
  action: string;
  resource?: string;
  details?: any;
  ip?: string;
  createdAt: Date;
  hash?: string;
}

const AuditSchema = new Schema<IAudit>({
  userId: { type: String },
  userEmail: { type: String },
  action: { type: String, required: true },
  resource: { type: String },
  details: { type: Schema.Types.Mixed },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
  hash: { type: String } // optional tamper-evidence
});

export default mongoose.model<IAudit>("Audit", AuditSchema);
