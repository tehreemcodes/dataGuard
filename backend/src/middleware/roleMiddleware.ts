// backend/src/middleware/roleMiddleware.ts
import { Response, NextFunction } from "express";
import { ReqWithUser } from "./authMiddleware";

export const requireRole = (roles: string[] = []) => {
  return (req: ReqWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      if (roles.length === 0 || roles.includes(user.role || "")) return next();
      return res.status(403).json({ message: "Forbidden - role not allowed" });
    } catch (err) {
      console.error("requireRole error", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
