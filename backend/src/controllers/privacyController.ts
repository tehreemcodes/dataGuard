// backend/src/controllers/privacyController.ts
import { Request, Response } from "express";

/**
 * Utility scoring logic – lightweight estimation tool
 * Privacy ↑ means:
 *   - Higher k, higher l
 *   - Lower epsilon (DP)
 *   - Higher generalization/suppression
 * Utility ↑ means:
 *   - Lower generalization/suppression
 *   - Higher epsilon
 */
export const analyzePrivacyUtility = async (req: Request, res: Response) => {
  try {
    const { k, l, epsilon, generalizationLevel, suppressionCount } = req.body;

    // Normalize values to scoring ranges
    const norm = (v: number, min: number, max: number) =>
      Math.max(0, Math.min(1, (v - min) / (max - min)));

    // Privacy score: influenced by k/l and small epsilon
    const kScore = norm(k, 1, 10);
    const lScore = norm(l, 1, 10);
    const epsilonScore = 1 - norm(epsilon, 0.01, 1.0); // smaller eps → more privacy

    // generalization impact
    const generalizationMap: any = { low: 0.2, medium: 0.6, high: 1.0 };
    const genScore = generalizationMap[generalizationLevel] || 0.5;

    const suppressionScore = suppressionCount ? Math.min(1, suppressionCount / 10) : 0;

    const privacyScore = 
      (0.3 * kScore) +
      (0.2 * lScore) +
      (0.3 * epsilonScore) +
      (0.1 * genScore) +
      (0.1 * suppressionScore);

    // Utility score decreases with privacy
    const utilityScore = 1 - privacyScore * 0.8;

    // Derived metrics
    const reIdRisk = Math.max(1, Math.round((1 - privacyScore) * 70));   // %
    const infoLoss = Math.round(privacyScore * 60);                      // %

    return res.json({
      privacyScore: Math.round(privacyScore * 100),
      utilityScore: Math.round(utilityScore * 100),
      reIdRisk,
      informationLoss: infoLoss,
    });

  } catch (err) {
    console.error("privacy analysis error:", err);
    res.status(500).json({ message: "Failed to analyze privacy/utility" });
  }
};
