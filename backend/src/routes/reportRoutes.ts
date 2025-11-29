// backend/src/routes/reportRoutes.ts
import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { generateReport } from "../controllers/reportController";

const router = express.Router();

// restrict to admin and compliance (they need to generate compliance reports)
router.post("/generate", requireAuth, requireRole(["admin","compliance"]), generateReport);

export default router;
