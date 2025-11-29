// Very basic k-anonymity enforcement by grouping quasi-identifiers
// This is a simple heuristic implementation for small datasets and demonstration.

import { laplaceNoise } from "./masking";

export const applyDifferentialPrivacyToNumber = (v: any, epsilon: number) => {
  if (v == null || isNaN(Number(v))) return v;
  const sensitivity = 1; // assumption; tune as needed
  const scale = sensitivity / (epsilon || 1);
  const noise = laplaceNoise(scale);
  return Number(v) + noise;
};

// k-anonymity naive: group by quasi-ids and generalize until groups >= k
// We implement a simple pass that will generalize quasi-ids when group size < k
export const enforceKAnonymity = (rows: any[], quasiIds: string[], k: number, generalizeLevels: Record<string,string>) => {
  if (k <= 1 || quasiIds.length === 0) return rows;
  // compute group key
  const groups = new Map<string, any[]>();
  for (const r of rows) {
    const key = quasiIds.map(q => (r[q] ?? "")).join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  // generalize groups smaller than k
  for (const [key, groupRows] of groups) {
    if (groupRows.length < k) {
      // generalize each quasiId based on requested level
      for (const r of groupRows) {
        for (const q of quasiIds) {
          const lvl = generalizeLevels[q] || "medium";
          // simple generalization: truncate or mask
          const v = r[q];
          if (v != null) {
            r[q] = String(v).slice(0, Math.max(0, 3 - (lvl === "high" ? 2 : lvl === "medium" ? 1 : 0))) + "...";
          }
        }
      }
    }
  }
  return rows;
};

// l-diversity naive: verify each equivalence class has >= l distinct sensitive values
export const checkLDiversity = (rows: any[], quasiIds: string[], sensitiveAttr: string, l: number) => {
  if (l <= 1) return true;
  const groups = new Map<string, Set<any>>();
  for (const r of rows) {
    const key = quasiIds.map(q => (r[q] ?? "")).join("|");
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key)!.add(r[sensitiveAttr]);
  }
  for (const s of groups.values()) {
    if (s.size < l) return false;
  }
  return true;
};
