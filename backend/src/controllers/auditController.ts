// auditController.ts
import { Request, Response } from "express";
import Audit from "../models/Audit";

export const listAudits = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, userEmail, action, from, to } = req.query as any;
    const q: any = {};
    if (userEmail) q.userEmail = userEmail;
    if (action) q.action = action;
    if (from || to) q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);

    const skip = (Number(page) - 1) * Number(limit);
    const rows = await Audit.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Audit.countDocuments(q);
    return res.json({ rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
