// backend/src/routes/datasetRoutes.ts
import express from "express";
import { uploadDataset, listDatasets, getDataset, deleteDataset } from "../controllers/datasetController";
import { upload } from "../middleware/uploadMiddleware";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.post(
  "/upload",
  requireAuth,
  requireRole(["admin", "analyst"]),
  upload.single("dataset"),
  uploadDataset
);

router.get("/", requireAuth, listDatasets);
router.get("/:id", requireAuth, getDataset);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteDataset);

export default router;
