// backend/src/controllers/adminController.ts
import { Request, Response } from "express";
import User from "../models/User";
import { logAudit } from "../utils/audit";

export const listPendingUsers = async (req: Request, res: Response) => {
  try {
    const pending = await User.find({ status: "pending" }).select("name email createdAt");
    return res.json(pending);
  } catch (err) {
    console.error("listPendingUsers error", err);
    return res.status(500).json({ message: "Failed to list pending users" });
  }
};

export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: "userId and role required" });
    if (!["admin", "analyst", "compliance"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ message: "User not found" });

    u.role = role as any;
    u.status = "active";
    await u.save();

    await logAudit({ action: "user.approved", userId: u._id.toString(), userEmail: u.email, details: { role }, ip: req.ip });

    return res.json({ message: "User approved", user: { id: u._id, email: u.email, role: u.role } });
  } catch (err) {
    console.error("approveUser error", err);
    return res.status(500).json({ message: "Failed to approve user" });
  }
};

export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ message: "User not found" });

    u.status = "rejected";
    u.role = "none";
    await u.save();

    await logAudit({ action: "user.rejected", userId: u._id.toString(), userEmail: u.email, ip: req.ip });

    return res.json({ message: "User rejected" });
  } catch (err) {
    console.error("rejectUser error", err);
    return res.status(500).json({ message: "Failed to reject user" });
  }
};
