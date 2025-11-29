// backend/src/controllers/reportController.ts
import { Request, Response } from "express";
import Dataset from "../models/Dataset";
import Policy from "../models/Policy";
import Job from "../models/Job";
import Audit from "../models/Audit";

/**
 * POST /api/reports/generate
 * body: {
 *   type: "gdpr" | "hipaa" | "pia",
 *   datasetIds?: string[],   // optional list, empty => include all
 *   policyIds?: string[],    // optional
 *   dateFrom?: string,       // ISO date
 *   dateTo?: string
 * }
 */
export const generateReport = async (req: Request, res: Response) => {
  try {
    const { type, datasetIds, policyIds, dateFrom, dateTo } = req.body;

    // Build filters
    const dateFilter: any = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);

    const auditQuery: any = {};
    if (Object.keys(dateFilter).length) auditQuery.createdAt = dateFilter;
    if (req.body.userEmail) auditQuery.userEmail = req.body.userEmail;

    // fetch datasets
    const dsFilter: any = {};
    if (datasetIds && Array.isArray(datasetIds) && datasetIds.length) dsFilter._id = { $in: datasetIds };

    const policyFilter: any = {};
    if (policyIds && Array.isArray(policyIds) && policyIds.length) policyFilter._id = { $in: policyIds };

    const [datasets, policies, jobs, audits] = await Promise.all([
      Dataset.find(dsFilter).lean(),
      Policy.find(policyFilter).lean(),
      Job.find({
        ...(datasetIds && datasetIds.length ? { datasetId: { $in: datasetIds } } : {}),
        ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
      }).sort({ createdAt: -1 }).lean(),
      Audit.find(auditQuery).sort({ createdAt: -1 }).limit(1000).lean()
    ]);

    // Basic analysis metrics
    const totalDatasets = datasets.length;
    const totalPolicies = policies.length;
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter((j:any) => j.status === "completed").length;
    const failedJobs = jobs.filter((j:any) => j.status === "failed").length;

    // Build report object
    const report = {
      metadata: {
        reportType: type || "custom",
        generatedBy: (req as any).user?.userEmail || "unknown",
        generatedAt: new Date().toISOString(),
        datasetCount: totalDatasets,
        policyCount: totalPolicies,
        jobCount: totalJobs,
        completedJobs,
        failedJobs,
        dateRange: { from: dateFrom || null, to: dateTo || null }
      },
      datasets: datasets.map(d => ({
        id: d._id,
        originalName: d.originalName,
        uploadedBy: d.uploadedBy,
        uploadedAt: d.uploadedAt,
        size: d.size,
        mimetype: d.mimetype,
        fields: d.fields || []
      })),
      policies: policies.map((p:any) => ({
        id: p._id,
        name: p.policyName,
        datasetId: p.datasetId,
        version: p.version,
        fields: p.fields,
        k: p.k,
        l: p.l,
        epsilon: p.epsilon,
        createdBy: p.createdBy,
        createdAt: p.createdAt
      })),
      jobs: jobs.map((j:any) => ({
        id: j._id,
        datasetId: j.datasetId,
        policyId: j.policyId,
        status: j.status,
        createdBy: j.createdBy,
        createdAt: j.createdAt,
        finishedAt: j.finishedAt,
        message: j.message
      })),
      audits: audits.map((a:any) => ({
        timestamp: a.createdAt,
        userEmail: a.userEmail,
        action: a.action,
        resource: a.resource,
        details: a.details,
        hash: a.hash
      }))
    };

    // Add compliance checks / quick findings for each dataset+policy
    // Very simple checks as examples:
    const findings: any[] = [];
    for (const p of report.policies) {
      const ds = report.datasets.find((d:any) => String(d.id) === String(p.datasetId));
      if (!ds) {
        findings.push({ policyId: p.id, severity: "HIGH", message: "Policy references missing dataset" });
        continue;
      }
      // Check if PII fields exist in dataset and whether masked
      const piiFields = ds.fields.filter((f:any) => ["email","name","phone","ssn","address","dob"].includes(f.name.toLowerCase()));
      if (piiFields.length === 0) {
        findings.push({ policyId: p.id, severity: "WARN", message: "No obvious PII detected in dataset fields" });
      } else {
        // check mask application (best-effort by comparing field names)
        for (const f of piiFields) {
          const rule = p.fields.find((pf:any) => pf.name === f.name);
          if (!rule) findings.push({ policyId: p.id, severity: "MEDIUM", message: `PII field ${f.name} has no masking rule in policy ${p.name}` });
        }
      }
      // simple check for k/l thresholds
      if (p.k < 2) findings.push({ policyId: p.id, severity: "MEDIUM", message: "k value is low (<2)" });
      if (p.l < 2) findings.push({ policyId: p.id, severity: "LOW", message: "l value is low (<2)" });
    }

    report["findings"] = findings;

    return res.json({ ok: true, report });
  } catch (err) {
    console.error("generateReport error", err);
    return res.status(500).json({ ok: false, message: "Failed to generate report" });
  }
};
