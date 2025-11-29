// frontend/src/pages/AdminUsers.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

type PendingUser = { _id: string; name: string; email: string; createdAt: string; };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminUsers: React.FC = () => {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/pending`, { headers: { Authorization: `Bearer ${token}` }});
      setPending(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch pending users");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id:string, role:string) => {
    if (!confirm(`Assign role ${role} to user?`)) return;
    try {
      await axios.post(`${API_URL}/api/admin/approve`, { userId: id, role }, { headers: { Authorization: `Bearer ${token}` }});
      alert("User approved");
      load();
    } catch (err:any) {
      console.error(err);
      alert("Approve failed: " + (err.response?.data?.message || err.message));
    }
  };

  const reject = async (id:string) => {
    if (!confirm(`Reject this user?`)) return;
    try {
      await axios.post(`${API_URL}/api/admin/reject`, { userId: id }, { headers: { Authorization: `Bearer ${token}` }});
      alert("User rejected");
      load();
    } catch (err:any) {
      console.error(err);
      alert("Reject failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Pending Users</h2>
          {loading ? <div>Loading...</div> : (
            <>
              {pending.length === 0 ? <div>No pending users</div> :
                <table className="w-full">
                  <thead className="text-left">
                    <tr><th>Name</th><th>Email</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {pending.map(u => (
                      <tr key={u._id} className="border-t">
                        <td className="py-2">{u.name}</td>
                        <td className="py-2">{u.email}</td>
                        <td className="py-2">{new Date(u.createdAt).toLocaleString()}</td>
                        <td className="py-2 space-x-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>approve(u._id,"analyst")}>Analyst</button>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>approve(u._id,"compliance")}>Compliance</button>
                          <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={()=>approve(u._id,"admin")}>Admin</button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={()=>reject(u._id)}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
