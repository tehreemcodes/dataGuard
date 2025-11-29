// frontend/src/pages/ClassifyDataset.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

interface Field {
  name: string;
  type: string;
  sensitivity: string;
  maskType: string;
  generalizationLevel: string;
}

const maskOptions = [
  "pseudonymize",
  "generalize",
  "suppress",
  "tokenize"
];

const generalizationLevels = [
  "low",
  "medium",
  "high"
];

const ClassifyDataset: React.FC = () => {
  const { id: datasetId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchClassification = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/classification/${datasetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const initializedFields = (res.data.fields || []).map((f: any) => ({
          name: f.name,
          type: f.type,
          sensitivity: f.sensitivity || "low",
          maskType: f.maskType || "pseudonymize",
          generalizationLevel: f.generalizationLevel || "medium"
        }));

        setFields(initializedFields);
      } catch (err: any) {
        console.error("Classification fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch classification");
      } finally {
        setLoading(false);
      }
    };

    if (datasetId) fetchClassification();
  }, [datasetId]);

  const handleFieldChange = (index: number, field: keyof Field, value: string) => {
    const updated = [...fields];
    (updated[index] as any)[field] = value;
    setFields(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const fieldsWithMasking = fields.map(f => ({
        name: f.name,
        type: f.type,
        sensitivity: f.sensitivity,
        maskType: f.maskType || 'pseudonymize',
        generalizationLevel: f.generalizationLevel || 'medium'
      }));

      console.log("Saving classification with fields:", fieldsWithMasking);

      const response = await axios.put(`${API_URL}/api/classification/${datasetId}`, { fields: fieldsWithMasking }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Classification saved:", response.data);
      navigate(`/create-policy/${datasetId}`);
    } catch (err: any) {
      console.error("Save classification error:", err);
      setError(err.response?.data?.message || "Failed to save classification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Classify Dataset</h2>
          <p className="text-gray-600 mb-8">We auto-detected sensitive fields in your dataset. Review and assign masking rules.</p>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

          {loading ? (
            <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p className="mt-4 text-gray-600">Loading classification...</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold">Column</th>
                      <th className="text-left p-3 font-semibold">Detected Type</th>
                      <th className="text-left p-3 font-semibold">Sensitivity</th>
                      <th className="text-left p-3 font-semibold">Mask Type</th>
                      <th className="text-left p-3 font-semibold">Generalization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{f.name}</td>
                        <td className="p-3 text-gray-700">{f.type}</td>
                        <td className="p-3">
                          <select value={f.sensitivity} onChange={(e) => handleFieldChange(idx, "sensitivity", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select value={f.maskType} onChange={(e) => handleFieldChange(idx, "maskType", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            {maskOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <select value={f.generalizationLevel} onChange={(e) => handleFieldChange(idx, "generalizationLevel", e.target.value)} disabled={f.maskType !== "generalize"} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            {generalizationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button onClick={() => navigate("/dashboard")} className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-md">Cancel</button>
                <button onClick={handleSave} disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md">{loading ? "Saving..." : "Save & Continue"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassifyDataset;
