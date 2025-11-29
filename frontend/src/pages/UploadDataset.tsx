// frontend/src/pages/UploadDataset.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const UploadDataset: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");
    const formData = new FormData();
    formData.append("dataset", file);

    try {
      const res = await axios.post(`${API_URL}/api/datasets/upload`, formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Dataset uploaded successfully!");
      const datasetId = res.data.dataset._id;
      navigate(`/classify/${datasetId}`);
    } catch (err: any) {
      alert("Upload failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Dataset</h1>
          <p className="text-slate-600 mb-6">Upload your CSV or JSON file to begin the anonymization process.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Dataset File</label>
              <input type="file" className="w-full border border-gray-300 rounded-xl p-3" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            <button onClick={handleUpload} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold">
              Upload File
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadDataset;
