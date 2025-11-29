// frontend/src/pages/CreatePolicy.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";

interface ClassifiedField {
  name: string;
  type: string;
  sensitivity: string;
  maskType: string;
  generalizationLevel: string;
}

const maskOptions = ["pseudonymize", "generalize", "suppress", "tokenize"];
const generalizationLevels = ["low", "medium", "high"];

const CreatePolicy: React.FC = () => {
  const { id: datasetId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [policyName, setPolicyName] = useState("");
  const [k, setK] = useState("2");
  const [l, setL] = useState("2");
  const [epsilon, setEpsilon] = useState("1.0");
  const [fields, setFields] = useState<ClassifiedField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDatasetFields = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/datasets/${datasetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const fieldsWithDefaults = (res.data.fields || []).map((f: any) => ({
          name: f.name,
          type: f.type || "unknown",
          sensitivity: f.sensitivity || "low",
          maskType: f.maskType || "pseudonymize",
          generalizationLevel: f.generalizationLevel || "medium"
        }));
        setFields(fieldsWithDefaults);
      } catch (err: any) {
        console.error("Error fetching dataset fields:", err);
        setError(err.response?.data?.message || "Failed to load dataset fields");
      }
    };

    if (datasetId) fetchDatasetFields();
  }, [datasetId]);

  const handleFieldChange = (index: number, field: keyof ClassifiedField, value: string) => {
    const updated = [...fields];
    (updated[index] as any)[field] = value;
    setFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const policyFields = fields.map(f => ({ name: f.name, maskType: f.maskType, generalizationLevel: f.generalizationLevel }));
      const res = await axios.post(`${API_URL}/api/policies`, {
        datasetId,
        policyName: policyName || `Policy-${Date.now()}`,
        fields: policyFields,
        k: parseInt(k) || 1,
        l: parseInt(l) || 1,
        epsilon: parseFloat(epsilon) || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate(`/run-job/${res.data.policy._id}`);
    } catch (err: any) {
      console.error("Policy creation error:", err);
      setError(err.response?.data?.message || "Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Policy</h2>
          <p className="text-gray-600 mb-8">Define masking rules and privacy parameters for anonymization.</p>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Name</label>
              <input type="text" value={policyName} onChange={(e) => setPolicyName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-md" />
            </div>

            {fields.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Field Masking Configuration</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="text-left p-3 font-semibold">Field</th>
                        <th className="text-left p-3 font-semibold">Mask Type</th>
                        <th className="text-left p-3 font-semibold">Generalization Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((f, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-800">{f.name}</td>
                          <td className="p-3">
                            <select value={f.maskType} onChange={(e) => handleFieldChange(idx, "maskType", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                              {maskOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            <select value={f.generalizationLevel} onChange={(e) => handleFieldChange(idx, "generalizationLevel", e.target.value)} disabled={f.maskType !== "generalize"} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                              {generalizationLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">k-Anonymity (k)</label>
                <input type="number" value={k} onChange={(e) => setK(e.target.value)} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">l-Diversity (l)</label>
                <input type="number" value={l} onChange={(e) => setL(e.target.value)} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Differential Privacy (ε)</label>
                <input type="number" step="0.1" value={epsilon} onChange={(e) => setEpsilon(e.target.value)} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-md" />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate(`/classify/${datasetId}`)} className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-md">Back</button>
              <button type="submit" disabled={loading || fields.length === 0} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md">{loading ? "Creating..." : "Create Policy & Continue"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePolicy;
