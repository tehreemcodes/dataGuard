// backend/src/controllers/classificationController.ts
import { Request, Response } from "express";
import Dataset from "../models/Dataset";
import csv from "csv-parser";
import fs from "fs";
import { detectPIIType } from "../services/piiDetection";
import { decryptToTemp, deleteFileSafe } from "../utils/encryption";
import path from "path";
import { logAudit } from "../utils/audit";

const SAMPLE_ROWS = 100;

export const detectClassification = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const dataset = await Dataset.findById(id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    const tmpPath = await decryptToTemp(dataset.encryptedPath);
    const ext = path.extname(dataset.originalName || "").toLowerCase();

    if (ext === ".csv") {
      const rows: any[] = [];
      fs.createReadStream(tmpPath)
        .pipe(csv())
        .on("data", (row) => {
          if (rows.length < SAMPLE_ROWS) rows.push(row);
        })
        .on("end", async () => {
          if (rows.length === 0) {
            deleteFileSafe(tmpPath);
            return res.status(400).json({ message: "Dataset empty" });
          }
          const columns = Object.keys(rows[0]);
          const fields = columns.map((col) => {
            const values = rows.map((r) => r[col]);
            const type = detectPIIType(col, values);
            const sensitivity = type === "unknown" ? "low" : (["email", "phone", "national_id"].includes(type) ? "high" : "medium");
            return { name: col, type, sensitivity, maskType: "pseudonymize", generalizationLevel: "medium" };
          });
          deleteFileSafe(tmpPath);
          return res.json({ fields });
        })
        .on("error", (err) => {
          deleteFileSafe(tmpPath);
          console.error("CSV read error", err);
          return res.status(500).json({ message: "Failed to parse CSV" });
        });
    } else if (ext === ".json") {
      const raw = fs.readFileSync(tmpPath, "utf-8");
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const sample = arr.slice(0, SAMPLE_ROWS);
      if (sample.length === 0) {
        deleteFileSafe(tmpPath);
        return res.status(400).json({ message: "JSON dataset empty" });
      }
      const columns = Array.from(new Set(sample.flatMap((r:any) => Object.keys(r))));
      const fields = columns.map((col) => {
        const values = sample.map((r:any) => r[col]);
        const type = detectPIIType(col, values);
        const sensitivity = type === "unknown" ? "low" : (["email", "phone", "national_id"].includes(type) ? "high" : "medium");
        return { name: col, type, sensitivity, maskType: "pseudonymize", generalizationLevel: "medium" };
      });
      deleteFileSafe(tmpPath);
      return res.json({ fields });
    } else {
      deleteFileSafe(tmpPath);
      return res.status(400).json({ message: "Unsupported file type for classification" });
    }
  } catch (err) {
    console.error("classification detect error", err);
    return res.status(500).json({ message: "Classification detect failed" });
  }
};

export const saveClassification = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { fields } = req.body;
    const dataset = await Dataset.findById(id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    // validate fields basic shape
    if (!Array.isArray(fields)) return res.status(400).json({ message: "fields must be an array" });

    dataset.fields = fields;
    dataset.status = "classified";
    // remove originalPath for security after classification
    if (dataset.originalPath && fs.existsSync(dataset.originalPath)) {
      try {
        fs.unlinkSync(dataset.originalPath);
      } catch (e) {
        console.warn("Could not remove originalPath:", e);
      }
    }
    dataset.originalPath = undefined;
    await dataset.save();

    await logAudit({
      userId: (req as any).user?.userId,
      userEmail: (req as any).user?.email,
      action: "dataset.classified",
      resource: dataset._id.toString(),
      details: { fieldsCount: fields.length }
    });

    return res.json({ message: "Classification saved", dataset });
  } catch (err) {
    console.error("save classification error", err);
    return res.status(500).json({ message: "Failed to save classification" });
  }
};
