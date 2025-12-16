// frontend/src/pages/RunJob.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const RunJob: React.FC = () => {
  const { id: datasetId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const jobStartedRef = useRef(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ⭐ Get policyId from query params
  const policyId = new URLSearchParams(window.location.search).get("policy");

  useEffect(() => {
    if (!policyId) {
      setMessage("Missing policy ID in URL");
      setStatus("failed");
      return;
    }

    if (jobStartedRef.current) return;
    jobStartedRef.current = true;

    const startJob = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/api/jobs`,
          { datasetId, policyId },
          { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );

        setJobId(res.data.jobId);
        setStatus("queued");
      } catch (err: any) {
        console.error("Job start error:", err);
        setMessage(err.response?.data?.message || "Failed to start job");
        setStatus("failed");
      }
    };

    startJob();
  }, [datasetId, policyId]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/jobs/${jobId}`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });

        if (cancelled) return;

        setStatus(res.data.status);
        setMessage(res.data.message || "");

        if (res.data.preview) setPreview(res.data.preview);

        if (res.data.status === "completed" || res.data.status === "failed") return;

        setTimeout(() => { if (!cancelled) poll(); }, 2000);
      } catch (err) {
        console.error(err);
        if (!cancelled) setTimeout(() => poll(), 3000);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [jobId]);

  const downloadMasked = async () => {
    if (!jobId || downloading) return;
    setDownloading(true);
    try {
      const response = await axios.get(`${API_URL}/api/jobs/download/${jobId}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `masked-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
      alert("Failed to download file: " + (err.response?.data?.message || err.message));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">

        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h1 className="text-2xl font-bold mb-2">Run Anonymization Job</h1>

          <p className="text-slate-600 mb-4">
            Dataset ID: {datasetId} <br />
            Policy ID: {policyId || "N/A"}
          </p>

          <div className="mb-4">
            <p>Status: <strong>{status || "Starting..."}</strong></p>
            {message && <p className="text-sm text-slate-500">{message}</p>}
          </div>

          {status === "completed" && (
            <>
              <h3 className="font-semibold mb-2">Preview (first 10 rows)</h3>
              <div className="overflow-x-auto border rounded mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview[0] && Object.keys(preview[0]).map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-t">
                        {Object.keys(r).map((h) => (
                          <td key={h} className="px-3 py-2 text-sm">{String(r[h])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={downloadMasked}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
              >
                Download Masked Dataset
              </button>
            </>
          )}

          {status === "failed" && (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              <strong>Job failed:</strong> {message}
            </div>
          )}

          {(!status || status === "queued" || status === "running") && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="animate-spin h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
              Job is processing. This page will update automatically.
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default RunJob;
