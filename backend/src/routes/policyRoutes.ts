import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { createPolicy, getPolicies, getPolicyById } from "../controllers/policyController";

const router = express.Router();

router.post("/", requireAuth, createPolicy);
router.get("/", requireAuth, getPolicies);
router.get("/:id", requireAuth, getPolicyById);

export default router;
