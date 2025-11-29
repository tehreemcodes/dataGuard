import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PolicyDetails: React.FC = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const token = auth.token;
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/policies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolicy(res.data);

      const v = await axios.get(`${API_URL}/api/policies/${id}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVersions([v.data.current, ...v.data.history]);
    } catch (err) {
      console.error(err);
      alert("Failed to load policy details");
    }
  };

  useEffect(() => { load(); }, [id]);

  const runJob = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/jobs`, {
        datasetId: policy.datasetId,
        policyId: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Job started");
      navigate(`/job/${res.data.jobId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to start job");
    }
  };

  if (!policy) return <div className="min-h-screen"><Header /><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        <h2 className="text-3xl font-bold">{policy.policyName}</h2>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-xl font-semibold mb-3">Masking Fields</h3>

          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Field</th>
                <th className="p-2 text-left">Mask Type</th>
                <th className="p-2 text-left">Generalization</th>
              </tr>
            </thead>
            <tbody>
              {policy.fields.map((f: any) => (
                <tr key={f.name} className="border-t">
                  <td className="p-2">{f.name}</td>
                  <td className="p-2">{f.maskType}</td>
                  <td className="p-2">{f.generalizationLevel || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-sm text-gray-700">
            <p>k-anonymity: {policy.k}</p>
            <p>l-diversity: {policy.l}</p>
            <p>Epsilon (DP): {policy.epsilon}</p>
          </div>
        </div>

        <button
          onClick={runJob}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Run Masking Job
        </button>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-xl font-semibold mb-3">Version History</h3>
          <ul className="space-y-2">
            {versions.map((v, idx) => (
              <li key={idx} className="border-b pb-2">
                <p className="font-semibold">Version {v.version}</p>
                <p className="text-sm text-gray-600">
                  {new Date(v.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

      </main>
    </div>
  );
};

export default PolicyDetails;
