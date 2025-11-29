// backend/src/controllers/policyController.ts
import { Request, Response } from "express";
import Policy from "../models/Policy";
import Dataset from "../models/Dataset";

export const createPolicy = async (req: Request, res: Response) => {
  try {
    const { datasetId, policyName, fields, k, l, epsilon } = req.body;

    console.log("RECEIVED FIELDS:", JSON.stringify(fields, null, 2));

    // validate dataset exists
    const ds = await Dataset.findById(datasetId);
    if (!ds) return res.status(404).json({ message: "Dataset not found" });

    // create policy
    const policy = await Policy.create({
      datasetId,
      policyName,
      fields: (fields || []).map((f: any) => ({
        name: f.name,
        maskType: f.maskType || "pseudonymize",
        generalizationLevel: f.generalizationLevel || "medium"
      })),
      k: Number(k) || 1,
      l: Number(l) || 1,
      epsilon: Number(epsilon) || 0,
      createdBy: (req as any).user?.userId || "unknown"
    });

    return res.json({ message: "Policy created successfully", policy });
  } catch (err) {
    console.error("Policy creation error:", err);
    return res.status(500).json({ message: "Failed to create policy" });
  }
};

export const getPolicies = async (req: Request, res: Response) => {
  try {
    const policies = await Policy.find({ createdBy: (req as any).user?.userId });
    return res.json(policies);
  } catch (err) {
    console.error("get policies error", err);
    return res.status(500).json({ message: "Failed to get policies" });
  }
};

export const getPolicyById = async (req: Request, res: Response) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    return res.json(policy);
  } catch (err) {
    console.error("get policy by id error", err);
    return res.status(500).json({ message: "Failed to get policy" });
  }
};
