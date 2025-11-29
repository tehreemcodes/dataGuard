// backend/src/controllers/statsController.ts
import { Request, Response } from "express";
import Dataset from "../models/Dataset";
import Policy from "../models/Policy";
import Job from "../models/Job";
import Audit from "../models/Audit";

export const getOverview = async (req: Request, res: Response) => {
  try {
    const [
  totalDatasets,
  totalPolicies,
  totalJobs,
  runningJobs,
  recentActivities,
  recentDatasets,
  recentPolicies,
  recentJobs
] = await Promise.all([
  Dataset.countDocuments(),
  Policy.countDocuments(),
  Job.countDocuments(),
  Job.countDocuments({ status: "running" }),
  Audit.find().sort({ createdAt: -1 }).limit(8),
  Dataset.find().sort({ uploadedAt: -1 }).limit(5),
  Policy.find().sort({ createdAt: -1 }).limit(5),
  Job.find().sort({ createdAt: -1 }).limit(5)   
]);

    return res.json({
  totalDatasets,
  totalPolicies,
  totalJobs,
  runningJobs,
  recentActivities,
  recentDatasets,
  recentPolicies,
  recentJobs   
});

  } catch (err) {
    console.error("stats overview error", err);
    return res.status(500).json({ message: "Failed to fetch overview stats" });
  }
};
