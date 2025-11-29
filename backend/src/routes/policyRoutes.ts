// backend/src/routes/policyRoutes.ts
import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  getPolicyVersions,
  getTemplates
} from "../controllers/policyController";

const router = express.Router();

router.post("/", requireAuth, createPolicy);
router.get("/", requireAuth, getPolicies);
router.get("/templates", requireAuth, getTemplates);            // new
router.get("/:id/versions", requireAuth, getPolicyVersions);   // new
router.get("/:id", requireAuth, getPolicyById);
router.put("/:id", requireAuth, updatePolicy);                 // new update endpoint

export default router;
