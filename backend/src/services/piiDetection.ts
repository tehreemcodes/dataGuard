// backend/src/services/piiDetection.ts
export const detectPIIType = (columnName: string, sampleValues: string[]) => {
  const lower = columnName.toLowerCase();

  if (lower.includes("email")) return "email";
  if (lower.includes("phone") || lower.includes("mobile") || lower.includes("tel")) return "phone";
  if (lower.includes("name")) return "name";
  if (lower.includes("dob") || lower.includes("birth") || lower.includes("date")) return "date_of_birth";
  if (lower.includes("address")) return "address";
  if (lower.includes("zip") || lower.includes("postal")) return "zipcode";
  if (lower.includes("ssn") || lower.includes("cnic") || lower.includes("id")) return "national_id";

  // sample-based detection
  const samples = sampleValues.slice(0, 100).filter(Boolean);

  for (const v of samples) {
    const s = String(v).trim();
    if (/^\S+@\S+\.\S+$/.test(s)) return "email";
    if (/^\+?\d{7,15}$/.test(s)) return "phone";
    if (/^\d{5,6}$/.test(s)) return "zipcode";
    if (/^\d{13,17}$/.test(s)) return "national_id";
    if (/\d{4}-\d{2}-\d{2}/.test(s)) return "date_of_birth";
  }

  return "unknown";
};
