// backend/src/routes/jobRoutes.ts
import express from "express";
import { createJob, getJob, downloadOutput } from "../controllers/jobController";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

// create job (analyst/admin)
router.post("/", requireAuth, requireRole(["admin","analyst"]), createJob);
// get job status
router.get("/:id", requireAuth, getJob);
// download masked output (only roles allowed to download)
router.get("/download/:id", requireAuth, requireRole(["admin","analyst","compliance"]), downloadOutput);

export default router;
