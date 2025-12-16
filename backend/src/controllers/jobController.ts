// backend/src/controllers/jobController.ts
import { Request, Response } from "express";
import Job from "../models/Job";
import Policy from "../models/Policy";
import Dataset from "../models/Dataset";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { logAudit } from "../utils/audit";
import { ReqWithUser } from "../middleware/authMiddleware";
import { decryptToTemp, encryptFile, deleteFileSafe } from "../utils/encryption";
import {
  pseudonymizeValue,
  suppressValue,
  tokenizeValue,
  generalizeValue,
  laplaceNoise
} from "../utils/masking";
import { enforceKAnonymity, applyDifferentialPrivacyToNumber, checkLDiversity } from "../utils/privacy";

const readCsvRows = (filePath: string, maxRows = Infinity): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (rows.length < maxRows) rows.push(row);
      })
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });
};

const writeCsvRows = (rows: any[], outPath: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!rows || rows.length === 0) {
      fs.writeFile(outPath, "", (err) => (err ? reject(err) : resolve()));
      return;
    }
    const headers = Object.keys(rows[0] || {});
    const w = fs.createWriteStream(outPath, { encoding: "utf8" });
    w.on("error", (err) => reject(err));
    w.on("finish", () => resolve());
    w.write(headers.join(",") + "\n");
    for (const r of rows) {
      const line = headers.map(h => {
        const v = r[h];
        if (v == null) return "";
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(",");
      w.write(line + "\n");
    }
    w.end();
  });
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.body;
    if (!policyId) return res.status(400).json({ message: "policyId required" });

    const policy = await Policy.findById(policyId);
    if (!policy) return res.status(404).json({ message: "Policy not found" });

    const dataset = await Dataset.findById(policy.datasetId);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    const job = await Job.create({
      policyId: policy._id.toString(),
      datasetId: dataset._id.toString(),
      createdBy: (req as any).user?.userId || null,
      status: "queued",
      createdAt: new Date()
    });

    // run pipeline asynchronously
    runAnonymization(job._id.toString(), policy, dataset).catch(async (err) => {
      console.error("Job failed", err);
      await Job.findByIdAndUpdate(job._id, { status: "failed", message: String(err), finishedAt: new Date() });
    });

    return res.json({ message: "Job started", jobId: job._id });
  } catch (err) {
    console.error("createJob error", err);
    return res.status(500).json({ message: "Failed to start job" });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.json(job);
  } catch (err) {
    console.error("getJob error", err);
    return res.status(500).json({ message: "Failed to get job" });
  }
};

export const runAnonymization = async (jobId: string, policyDoc: any, datasetDoc: any) => {
  console.log("CWD:", process.cwd());
  console.log("====== STARTING JOB ======");
  console.log("JOB ID:", jobId);
  await Job.findByIdAndUpdate(jobId, { status: "running", startedAt: new Date() });

  let tmpPath = "";
  try {
    // decrypt dataset
    console.log("DECRYPTING...");
    tmpPath = await decryptToTemp(datasetDoc.encryptedPath);
    console.log("DECRYPTED TEMP PATH:", tmpPath);

    const rows = await readCsvRows(tmpPath);
    console.log("CSV READ COMPLETE:", rows.length, "rows");
    if (!rows || rows.length === 0) {
      await Job.findByIdAndUpdate(jobId, { status: "failed", message: "Dataset empty", finishedAt: new Date() });
      deleteFileSafe(tmpPath);
      return;
    }

    // choose mask config: prefer policy.fields, otherwise datasetDoc.fields
    const maskConfig = (policyDoc.fields && policyDoc.fields.length) ? policyDoc.fields : (datasetDoc.fields || []);
    const fieldPolicies: Record<string, any> = {};
    (maskConfig || []).forEach((f: any) => {
      fieldPolicies[String(f.name)] = f;
    });

    // copy rows
    let maskedRows = rows.map(r => ({ ...r }));

    // apply field-level masking
    for (const row of maskedRows) {
      for (const [fieldName, fp] of Object.entries(fieldPolicies)) {
        const rule = fp as any;
        const orig = row[fieldName];

        if (!rule || !rule.maskType) continue;

        switch (rule.maskType) {
          case "pseudonymize":
            row[fieldName] = pseudonymizeValue(orig);
            break;
          case "suppress":
            row[fieldName] = suppressValue(orig);
            break;
          case "tokenize":
            row[fieldName] = tokenizeValue(orig);
            break;
          case "generalize":
            row[fieldName] = generalizeValue(orig, rule.generalizationLevel || "medium");
            break;
          default:
            break;
        }
      }
    }

    // k-anonymity
    const quasiIds = (maskConfig || []).filter((f:any) => f.maskType !== "suppress").map((f:any) => String(f.name));
    if (policyDoc.k && policyDoc.k > 1) {
      maskedRows = enforceKAnonymity(maskedRows, quasiIds, policyDoc.k, (policyDoc.fields || []).reduce((acc:any, f:any)=> { acc[f.name]=f.generalizationLevel; return acc; }, {}));
    }

    // differential privacy (simple numeric noise)
    if (policyDoc.epsilon && policyDoc.epsilon > 0) {
      const numericFields = Object.keys(maskedRows[0] || {}).filter(h => !isNaN(Number(maskedRows[0][h])));
      for (const r of maskedRows) {
        for (const nf of numericFields) {
          r[nf] = applyDifferentialPrivacyToNumber(r[nf], policyDoc.epsilon);
        }
      }
    }

    // l-diversity check (basic)
    if (policyDoc.l && policyDoc.l > 1) {
      const sensitiveField = (maskConfig || []).find((f: any) => String(f.type).toLowerCase() === "unknown" || String(f.sensitivity).toLowerCase() === "high");
      if (sensitiveField) {
        const ok = checkLDiversity(maskedRows, quasiIds, sensitiveField.name, policyDoc.l);
        if (!ok) {
          await Job.findByIdAndUpdate(jobId, { message: "l-diversity not satisfied; results generated but review recommended" });
        }
      }
    }

    // ensure uploads directory (absolute)
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const baseName = path.basename(datasetDoc.originalName || datasetDoc.storedName || "dataset.csv");
    const safeBase = baseName.includes(".") ? baseName : `${baseName}.csv`;
    const outName = `masked-${Date.now()}-${safeBase}`;
    const outPath = path.join(uploadsDir, outName);

    console.log("OUTPATH:", outPath);

    await writeCsvRows(maskedRows, outPath);
    console.log("CHECK FILE EXISTS AFTER WRITE:", fs.existsSync(outPath));

    // encrypt output
    const encOutName = `enc-${outName}`;
    const encOutPath = path.join(uploadsDir, encOutName);

    console.log("CHECK FILE EXISTS BEFORE ENCRYPTION:", fs.existsSync(outPath));
    await encryptFile(outPath, encOutPath);
    console.log("CHECK ENCRYPTED EXISTS:", fs.existsSync(encOutPath));

    const preview = maskedRows.slice(0, 10);
    await Job.findByIdAndUpdate(jobId, {
      status: "completed",
      encryptedOutputPath: encOutPath,
      preview,
      finishedAt: new Date(),
      message: "Completed"
    });

    deleteFileSafe(tmpPath);
    deleteFileSafe(outPath);

    console.log("JOB COMPLETED SUCCESSFULLY", jobId);
  } catch (err) {
    console.error("runAnonymization error", err);
    await Job.findByIdAndUpdate(jobId, { status: "failed", message: String(err), finishedAt: new Date() });
    if (typeof tmpPath === "string" && tmpPath) deleteFileSafe(tmpPath);
  }
};

// inside backend/src/controllers/jobController.ts -> replace downloadOutput implementation

export const downloadOutput = async (req: ReqWithUser, res: Response) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // check permission: requireAuth & role checked by route that calls this
    const role = req.user?.role || "analyst";

    // We'll generate role-specific masked output on the fly:
    // decrypt the original dataset (use dataset.encryptedPath)
    const dataset = await Dataset.findById(job.datasetId);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    // decrypt original encrypted dataset to tmp
    const tmp = await decryptToTemp(dataset.encryptedPath);

    // read csv rows
    const rows = await readCsvRows(tmp);
    if (!rows || rows.length === 0) {
      deleteFileSafe(tmp);
      return res.status(404).json({ message: "Dataset empty" });
    }

    // build policy map (policy referenced by job.policyId)
    const policy = await Policy.findById(job.policyId);
    if (!policy) {
      deleteFileSafe(tmp);
      return res.status(404).json({ message: "Policy not found" });
    }

    // apply masking based on policy but adapt for role:
    // For role-based rules we allow policy.fields to include role overrides
    const roleAwareFields: Record<string, any> = {};
    (policy.fields || []).forEach((f: any) => {
      // each field can optionally have roleOverrides: { admin: {maskType, genLevel}, analyst: {...} }
      if (f.roleOverrides && f.roleOverrides[role]) {
        roleAwareFields[f.name] = { ...f, ...f.roleOverrides[role] };
      } else {
        roleAwareFields[f.name] = f;
      }
    });

    let maskedRows = rows.map(r => ({ ...r }));
    for (const row of maskedRows) {
      for (const [fieldName, fp] of Object.entries(roleAwareFields)) {
        const rule = fp as any;
        const orig = row[fieldName];
        if (!rule || !rule.maskType) continue;

        switch (rule.maskType) {
          case "pseudonymize":
            row[fieldName] = pseudonymizeValue(orig);
            break;
          case "suppress":
            row[fieldName] = suppressValue(orig);
            break;
          case "tokenize":
            row[fieldName] = tokenizeValue(orig);
            break;
          case "generalize":
            row[fieldName] = generalizeValue(orig, rule.generalizationLevel || "medium");
            break;
          default:
            break;
        }
      }
    }

    // Write maskedRows to a temp file and stream to user
    const tempOutName = `masked-download-${Date.now()}.csv`;
    const tempOutPath = path.join(process.cwd(), "uploads", tempOutName);

    // ensure uploads dir
    if (!fs.existsSync(path.join(process.cwd(), "uploads"))) fs.mkdirSync(path.join(process.cwd(), "uploads"));

    await writeCsvRows(maskedRows, tempOutPath);

    res.setHeader("Content-Disposition", `attachment; filename="${dataset.originalName || 'masked.csv'}"`);
    const stream = fs.createReadStream(tempOutPath);
    stream.pipe(res);
    stream.on("end", () => {
      deleteFileSafe(tempOutPath);
    });
    stream.on("error", (err) => {
      console.error("stream error", err);
      deleteFileSafe(tempOutPath);
    });

    // audit
    await logAudit({
      userId: req.user?.userId,
      userEmail: req.user?.email,
      action: "job.download",
      resource: jobId,
      details: { role }
    });

    // finally cleanup tmp (decrypted source)
    deleteFileSafe(tmp);

  } catch (err) {
    console.error("download error", err);
    return res.status(500).json({ message: "Failed to download file" });
  }
};
