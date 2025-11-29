import express from "express";
import { analyzePrivacyUtility } from "../controllers/privacyController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/analyze", requireAuth, analyzePrivacyUtility);

export default router;
