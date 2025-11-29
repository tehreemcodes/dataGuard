import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { listAudits } from "../controllers/auditController";

const router = express.Router();
router.get("/", requireAuth, requireRole(["admin","compliance"]), listAudits);
export default router;
