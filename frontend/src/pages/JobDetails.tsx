import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const JobDetails: React.FC = () => {
  const { auth } = useAuth();
  const token = auth.token;

  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJob(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000); // auto-refresh every 3s
    return () => clearInterval(interval);
  }, [id]);

  const download = () => {
    window.open(`${API_URL}/api/jobs/download/${id}?token=${token}`, "_blank");
  };

  if (loading || !job) return <div><Header /><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        <h2 className="text-3xl font-bold">Job Details</h2>

        <div className="bg-white p-6 rounded-xl shadow border">
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Dataset:</strong> {job.datasetId}</p>
          <p><strong>Policy:</strong> {job.policyId}</p>
          <p><strong>Created At:</strong> {new Date(job.createdAt).toLocaleString()}</p>
          {job.finishedAt && (
            <p><strong>Finished At:</strong> {new Date(job.finishedAt).toLocaleString()}</p>
          )}
        </div>

        {job.preview && job.preview.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-3">Preview</h3>

            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(job.preview[0]).map(h => (
                    <th key={h} className="p-2 border-b text-left">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {job.preview.map((row: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    {Object.keys(row).map(col => (
                      <td key={col} className="p-2">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {job.status === "completed" && (
          <button
            onClick={download}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Download Masked Dataset
          </button>
        )}

      </main>
    </div>
  );
};

export default JobDetails;
