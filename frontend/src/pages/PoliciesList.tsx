import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PoliciesList: React.FC = () => {
  const { auth } = useAuth();
  const token = auth.token;

  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/policies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolicies(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Policies</h2>

        <div className="bg-white p-6 rounded-xl shadow border overflow-x-auto">
          {loading ? (
            <p>Loading...</p>
          ) : policies.length === 0 ? (
            <p>No policies created yet</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Policy Name</th>
                  <th className="p-2 text-left">Dataset</th>
                  <th className="p-2 text-left">Version</th>
                  <th className="p-2 text-left">Created At</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {policies.map((p: any) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">{p.policyName}</td>
                    <td className="p-2">{p.datasetId}</td>
                    <td className="p-2">{p.version}</td>
                    <td className="p-2">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      <Link 
                        to={`/policy/${p._id}`}
                        className="text-cyan-600 hover:text-cyan-800 underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default PoliciesList;
