import express from "express";
import { detectClassification, saveClassification } from "../controllers/classificationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:id", requireAuth, detectClassification);
router.put("/:id", requireAuth, saveClassification);

export default router;
