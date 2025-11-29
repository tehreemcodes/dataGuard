import crypto from "crypto";

// irreversible deterministic pseudonymization
export const pseudonymizeValue = (value: string) => {
  if (!value) return "";
  const hash = crypto.createHash("sha256").update(value).digest("hex");
  return "PSEUDO_" + hash.substring(0, 10);
};

// suppression
export const suppressValue = (_value: any) => {
  return "*****";
};

// random irreversible token
export const tokenizeValue = (_value: any) => {
  return "TKN_" + crypto.randomBytes(4).toString("hex");
};

// generalization based on type/level
export const generalizeValue = (value: any, level: string) => {
  if (!value) return "";

  const s = String(value);

  // DOB handling (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    if (level === "low") return s.substring(0, 7) + "-XX"; // YYYY-MM-XX
    if (level === "medium") return s.substring(0, 4) + "-XX"; // YYYY-XX
    return s.substring(0, 3) + "X"; // YYYX
  }

  // Address → city-level
  if (s.includes(",")) {
    return s.split(",").pop()?.trim() || "";
  }

  // Names
  if (level === "low") return s.charAt(0) + "*****";
  if (level === "medium") return s.split(" ")[0];
  return "REDACTED";
};

// Laplace noise for differential privacy
export const laplaceNoise = (scale: number) => {
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
};
