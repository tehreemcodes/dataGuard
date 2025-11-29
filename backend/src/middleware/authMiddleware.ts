// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_in_env";

export type ReqWithUser = Request & { user?: { userId: string; role?: string; email?: string; status?: string; } };

export const requireAuth = async (req: ReqWithUser, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "No token provided" });
    const token = auth.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) return res.status(401).json({ message: "Invalid token" });

    // attach minimal user info. Optionally fetch user from DB for live role checks
    const user = await User.findById(decoded.userId).select("role email name");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { userId: user._id.toString(), role: user.role, email: user.email, status: user.status };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
