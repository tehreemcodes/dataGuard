// backend/src/utils/audit.ts
import Audit from "../models/Audit";
import crypto from "crypto";

export const logAudit = async (opts: {
  userId?: string;
  userEmail?: string;
  action: string;
  resource?: string;
  details?: any;
  ip?: string;
}) => {
  try {
    const payload = {
      userId: opts.userId,
      userEmail: opts.userEmail,
      action: opts.action,
      resource: opts.resource,
      details: opts.details,
      ip: opts.ip,
      createdAt: new Date()
    };
    // compute a simple tamper-evidence hash (not a blockchain, but useful)
    const hash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const rec = await Audit.create({ ...payload, hash });
    return rec;
  } catch (err) {
    console.error("logAudit error", err);
  }
};
