// backend/src/controllers/policyController.ts
import { Request, Response } from "express";
import Policy from "../models/Policy";
import Dataset from "../models/Dataset";
import { POLICY_TEMPLATES } from "../utils/policyTemplates";
import { logAudit } from "../utils/audit";

/**
 * Create a new policy (version 1)
 * POST /api/policies
 */
export const createPolicy = async (req: Request, res: Response) => {
  try {
    const { datasetId, policyName, fields, k, l, epsilon } = req.body;

    // validate dataset exists
    const ds = await Dataset.findById(datasetId);
    if (!ds) return res.status(404).json({ message: "Dataset not found" });

    const policy = await Policy.create({
      datasetId,
      policyName,
      fields: (fields || []).map((f: any) => ({
        name: f.name,
        maskType: f.maskType || "pseudonymize",
        generalizationLevel: f.generalizationLevel || "medium",
        roleOverrides: f.roleOverrides || undefined
      })),
      k: Number(k) || 1,
      l: Number(l) || 1,
      epsilon: Number(epsilon) || 0,
      createdBy: (req as any).user?.userId || "unknown",
      version: 1,
      versions: [] // initial empty history
    });

    await logAudit({
      action: "policy.create",
      userId: (req as any).user?.userId,
      userEmail: (req as any).user?.email,
      resource: policy._id.toString(),
      details: { policyName, datasetId }
    });

    return res.json({ message: "Policy created successfully", policy });
  } catch (err) {
    console.error("Policy creation error:", err);
    return res.status(500).json({ message: "Failed to create policy" });
  }
};

/**
 * Update an existing policy — create a new version snapshot
 * PUT /api/policies/:id
 */
export const updatePolicy = async (req: Request, res: Response) => {
  try {
    const policyId = req.params.id;
    const { policyName, fields, k, l, epsilon } = req.body;

    const policy = await Policy.findById(policyId);
    if (!policy) return res.status(404).json({ message: "Policy not found" });

    // push current snapshot to versions
    const snapshot = {
      version: policy.version || 1,
      fields: policy.fields,
      k: policy.k,
      l: policy.l,
      epsilon: policy.epsilon,
      createdBy: policy.createdBy,
      createdAt: policy.createdAt
    };

    policy.versions = policy.versions || [];
    policy.versions.push(snapshot);

    // increment version and update
    policy.version = (policy.version || 1) + 1;
    policy.policyName = policyName || policy.policyName;
    policy.fields = (fields || policy.fields).map((f: any) => ({
      name: f.name,
      maskType: f.maskType || "pseudonymize",
      generalizationLevel: f.generalizationLevel || "medium",
      roleOverrides: f.roleOverrides || undefined
    }));
    policy.k = Number(k) || policy.k;
    policy.l = Number(l) || policy.l;
    policy.epsilon = Number(epsilon) || policy.epsilon;
    policy.createdBy = (req as any).user?.userId || policy.createdBy;
    policy.createdAt = new Date();

    await policy.save();

    await logAudit({
      action: "policy.update",
      userId: (req as any).user?.userId,
      userEmail: (req as any).user?.email,
      resource: policy._id.toString(),
      details: { version: policy.version }
    });

    return res.json({ message: "Policy updated", policy });
  } catch (err) {
    console.error("updatePolicy error", err);
    return res.status(500).json({ message: "Failed to update policy" });
  }
};

/**
 * List versions for policy
 * GET /api/policies/:id/versions
 */
export const getPolicyVersions = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const p = await Policy.findById(id);
    if (!p) return res.status(404).json({ message: "Policy not found" });

    const versions = p.versions || [];
    // include current as latest in response
    const currentSnapshot = {
      version: p.version || 1,
      fields: p.fields,
      k: p.k,
      l: p.l,
      epsilon: p.epsilon,
      createdBy: p.createdBy,
      createdAt: p.createdAt
    };

    return res.json({ current: currentSnapshot, history: versions });
  } catch (err) {
    console.error("getPolicyVersions error", err);
    return res.status(500).json({ message: "Failed to fetch versions" });
  }
};

/**
 * Get templates list
 * GET /api/policies/templates
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = Object.values(POLICY_TEMPLATES);
    return res.json(templates);
  } catch (err) {
    console.error("getTemplates error", err);
    return res.status(500).json({ message: "Failed to fetch templates" });
  }
};

/**
 * Existing getPolicies and getPolicyById unchanged but ensure they exist
 */
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
