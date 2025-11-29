import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { getOverview } from "../controllers/statsController";

// All roles can see dashboard stats
const router = express.Router();

router.get("/overview", requireAuth, getOverview);

export default router;
