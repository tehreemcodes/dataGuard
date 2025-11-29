// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard: React.FC = () => {
  const { auth } = useAuth();
  const token = auth.token;
  const role = auth.role;

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err: any) {
      console.error(err);
      alert("Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const badge = (status: string) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    if (status === "running") return `${base} bg-yellow-100 text-yellow-700`;
    if (status === "completed") return `${base} bg-green-100 text-green-700`;
    if (status === "failed") return `${base} bg-red-100 text-red-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="p-10 text-center">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto p-6 space-y-12">

        {/* ===== METRIC CARDS ===== */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border">
              <p className="text-slate-500">Total Datasets</p>
              <p className="text-3xl font-bold">{stats.totalDatasets}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <p className="text-slate-500">Total Policies</p>
              <p className="text-3xl font-bold">{stats.totalPolicies}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <p className="text-slate-500">Total Jobs</p>
              <p className="text-3xl font-bold">{stats.totalJobs}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <p className="text-slate-500">Running Jobs</p>
              <p className="text-3xl font-bold">{stats.runningJobs}</p>
            </div>
          </div>
        </section>

        {/* ===== RECENT ACTIVITY (ADMIN + COMPLIANCE ONLY) ===== */}
        {(role === "admin" || role === "compliance") && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="bg-white p-6 rounded-xl shadow border">
              {stats.recentActivities.length === 0 ? (
                <p>No recent audit activity found</p>
              ) : (
                <ul className="space-y-3">
                  {stats.recentActivities.map((a: any) => (
                    <li key={a._id} className="border-b pb-2">
                      <p className="font-semibold">{a.action}</p>
                      <p className="text-sm text-gray-600">
                        {a.userEmail || "Unknown user"} •{" "}
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* ===== RECENT DATASETS (ALL ROLES) ===== */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Datasets</h2>
          <div className="bg-white p-6 rounded-xl shadow border overflow-x-auto">
            {stats.recentDatasets.length === 0 ? (
              <p>No datasets found</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left">Name</th>
                    <th className="py-2 px-3 text-left">Uploaded By</th>
                    <th className="py-2 px-3 text-left">Uploaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentDatasets.map((d: any) => (
                    <tr key={d._id} className="border-t">
                      <td className="py-2 px-3">{d.originalName}</td>
                      <td className="py-2 px-3">{d.uploadedBy}</td>
                      <td className="py-2 px-3">
                        {new Date(d.uploadedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ===== RECENT POLICIES (ADMIN + ANALYST) ===== */}
        {(role === "admin" || role === "analyst") && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Policies</h2>
            <div className="bg-white p-6 rounded-xl shadow border overflow-x-auto">
              {stats.recentPolicies.length === 0 ? (
                <p>No policies found</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left">Policy Name</th>
                      <th className="py-2 px-3 text-left">Dataset</th>
                      <th className="py-2 px-3 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPolicies.map((p: any) => (
                      <tr key={p._id} className="border-t">
                        <td className="py-2 px-3">{p.policyName}</td>
                        <td className="py-2 px-3">{p.datasetId}</td>
                        <td className="py-2 px-3">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* ===== RECENT JOBS (ROLE-AWARE SECTION) ===== */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Jobs</h2>
          <div className="bg-white p-6 rounded-xl shadow border overflow-x-auto">

            {stats.recentJobs.length === 0 ? (
              <p>No jobs found</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left">Job ID</th>
                    <th className="py-2 px-3 text-left">Dataset</th>
                    <th className="py-2 px-3 text-left">Created By</th>
                    <th className="py-2 px-3 text-left">Status</th>
                    <th className="py-2 px-3 text-left">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {stats.recentJobs.map((j: any) => (
                    <tr key={j._id} className="border-t">
                      <td className="py-2 px-3">
                        <Link to={`/job/${j._id}`} className="text-cyan-600 underline">
                          {j._id}
                        </Link>
                      </td>
                      <td className="py-2 px-3">{j.datasetId}</td>
                      <td className="py-2 px-3">{j.createdBy || "-"}</td>
                      <td className="py-2 px-3">
                        <span className={badge(j.status)}>{j.status}</span>
                      </td>
                      <td className="py-2 px-3">
                        {new Date(j.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
