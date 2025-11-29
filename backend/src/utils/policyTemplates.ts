// backend/src/utils/policyTemplates.ts
export const POLICY_TEMPLATES: Record<string, any> = {
  gdpr: {
    id: "gdpr",
    name: "GDPR - Personal Data",
    description: "Recommended masking for GDPR (EU) compliance",
    fields: [
      { name: "email", maskType: "pseudonymize", generalizationLevel: "low" },
      { name: "phone", maskType: "suppress" },
      { name: "name", maskType: "generalize", generalizationLevel: "low" },
      { name: "address", maskType: "generalize", generalizationLevel: "low" }
    ],
    recommended: { k: 2, l: 2, epsilon: 0.1 }
  },

  hipaa: {
    id: "hipaa",
    name: "HIPAA - Protected Health Info",
    description: "Recommended masking for HIPAA (US) compliance",
    fields: [
      { name: "name", maskType: "suppress" },
      { name: "dob", maskType: "generalize", generalizationLevel: "medium" },
      { name: "address", maskType: "generalize", generalizationLevel: "low" },
      { name: "phone", maskType: "suppress" }
    ],
    recommended: { k: 3, l: 2, epsilon: 0.0 }
  }
};
