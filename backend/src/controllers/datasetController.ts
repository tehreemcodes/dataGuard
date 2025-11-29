// backend/src/controllers/datasetController.ts
import { Request, Response } from "express";
import Dataset from "../models/Dataset";
import path from "path";
import { encryptFile, decryptToTemp, deleteFileSafe } from "../utils/encryption";
import fs from "fs";

export const uploadDataset = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const originalPath = req.file.path;
    const encName = "enc-" + req.file.filename;
    const encPath = path.join("uploads", encName);

    await encryptFile(originalPath, encPath);

    const dataset = await Dataset.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      originalPath,
      encryptedPath: encPath,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: (req as any).user.userId,
      status: "uploaded",
    });

    return res.json({ message: "Dataset uploaded & encrypted", dataset });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Dataset upload failed" });
  }
};

// 📌 LIST ALL DATASETS (Dashboard section)
export const listDatasets = async (req: Request, res: Response) => {
  try {
    const datasets = await Dataset.find({ uploadedBy: (req as any).user.userId })
      .sort({ uploadedAt: -1 });

    res.json(datasets);
  } catch (err) {
    console.error("listDatasets error:", err);
    res.status(500).json({ message: "Failed to fetch datasets" });
  }
};

// 📌 GET SINGLE DATASET (Needed for createPolicy → load fields)
export const getDataset = async (req: Request, res: Response) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    res.json(dataset);
  } catch (err) {
    console.error("getDataset error:", err);
    res.status(500).json({ message: "Failed to fetch dataset" });
  }
};

// 📌 DELETE DATASET (Admin-only feature)
export const deleteDataset = async (req: Request, res: Response) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    // delete files safely
    if (dataset.originalPath) deleteFileSafe(dataset.originalPath);
    if (dataset.encryptedPath) deleteFileSafe(dataset.encryptedPath);

    await dataset.deleteOne();

    res.json({ message: "Dataset deleted" });
  } catch (err) {
    console.error("deleteDataset error:", err);
    res.status(500).json({ message: "Failed to delete dataset" });
  }
};
