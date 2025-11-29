// backend/src/routes/adminRoutes.ts
import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { listPendingUsers, approveUser, rejectUser } from "../controllers/adminController";

const router = express.Router();

router.get("/pending", requireAuth, requireRole(["admin"]), listPendingUsers);
router.post("/approve", requireAuth, requireRole(["admin"]), approveUser);
router.post("/reject", requireAuth, requireRole(["admin"]), rejectUser);

export default router;
