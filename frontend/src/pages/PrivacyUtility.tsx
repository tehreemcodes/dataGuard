// frontend/src/pages/PrivacyUtility.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PrivacyUtility: React.FC = () => {
  const { auth } = useAuth();
  const token = auth.token;
  const navigate = useNavigate();

  // slider 0 (full utility) → 100 (full privacy)
  const [slider, setSlider] = useState(50);

  const [analysis, setAnalysis] = useState<any>(null);

  // derived anonymization parameters
  const k = Math.round(1 + (slider / 100) * 9);              // 1 → 10
  const l = Math.round(1 + (slider / 100) * 5);              // 1 → 6
  const epsilon = +(1 - slider / 100).toFixed(2);            // 1.0 → 0.0
  const generalizationLevel = slider < 35 ? "low" : slider < 70 ? "medium" : "high";
  const suppressionCount = slider > 70 ? 3 : 1;

  // call backend to compute metrics
  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/api/privacy/analyze`,
          { k, l, epsilon, generalizationLevel, suppressionCount },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnalysis(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    run();
  }, [slider]);

  const applySettings = () => {
    alert("Privacy/utility parameters applied successfully!");
    navigate(-1); // return to previous page (policy or job run)
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto p-6 space-y-6">

        <h2 className="text-3xl font-bold">Privacy–Utility Tradeoff</h2>

        <div className="bg-white p-6 shadow rounded-xl border">

          <label className="font-semibold">Adjust Tradeoff</label>
          <input
            type="range"
            min="0"
            max="100"
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            className="w-full mt-3"
          />

          <div className="text-center text-slate-600 mt-1">
            {slider <= 30 && "High Utility / Low Privacy"}
            {slider > 30 && slider < 70 && "Balanced Mode"}
            {slider >= 70 && "High Privacy / Low Utility"}
          </div>

          {analysis && (
            <div className="mt-6 grid grid-cols-2 gap-4">

              <div className="bg-slate-100 p-4 rounded-xl shadow-inner">
                <p className="text-sm text-gray-600">Privacy Score</p>
                <p className="text-3xl font-bold text-emerald-600">{analysis.privacyScore}%</p>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl shadow-inner">
                <p className="text-sm text-gray-600">Utility Score</p>
                <p className="text-3xl font-bold text-blue-600">{analysis.utilityScore}%</p>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl shadow-inner col-span-1">
                <p className="text-sm text-gray-600">Re-Identification Risk</p>
                <p className="text-xl font-bold text-red-600">{analysis.reIdRisk}%</p>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl shadow-inner col-span-1">
                <p className="text-sm text-gray-600">Information Loss</p>
                <p className="text-xl font-bold text-orange-600">{analysis.informationLoss}%</p>
              </div>

            </div>
          )}

          {/* Derived parameters */}
          <div className="mt-6 text-sm text-gray-700">
            <p><strong>k-anonymity:</strong> {k}</p>
            <p><strong>l-diversity:</strong> {l}</p>
            <p><strong>Epsilon (DP):</strong> {epsilon}</p>
            <p><strong>Generalization:</strong> {generalizationLevel}</p>
            <p><strong>Suppression:</strong> {suppressionCount} fields</p>
          </div>

          <button
            onClick={applySettings}
            className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Apply Settings
          </button>

        </div>

      </main>
    </div>
  );
};

export default PrivacyUtility;
