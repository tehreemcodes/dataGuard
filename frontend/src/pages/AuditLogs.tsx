// frontend/src/pages/AuditLogs.tsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

type AuditRow = {
  _id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource?: string;
  details?: any;
  ip?: string;
  createdAt: string;
  hash?: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatDateForQuery = (d?: Date) => (d ? d.toISOString() : undefined);

const AuditLogs: React.FC = () => {
  const { auth } = useAuth();
  const token = auth.token;

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters
  const [userEmail, setUserEmail] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (userEmail) params.userEmail = userEmail;
      if (action) params.action = action;
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await axios.get(`${API_URL}/api/audit`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRows(res.data.rows || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch audit logs", err);
      alert("Failed to fetch audit logs: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  const onFilterApply = () => {
    setPage(1);
    fetchData();
  };

  const onClearFilters = () => {
    setUserEmail("");
    setAction("");
    setFrom(undefined);
    setTo(undefined);
    setPage(1);
    fetchData();
  };

  // CSV export
  const exportCSV = () => {
    if (!rows || rows.length === 0) {
      alert("No rows to export");
      return;
    }
    const headers = ["createdAt", "userEmail", "action", "resource", "details", "ip", "hash"];
    const csvRows = [
      headers.join(","),
      ...rows.map((r) => {
        const details = typeof r.details === "string" ? r.details : JSON.stringify(r.details || "");
        const esc = (s: any) => `"${String(s || "").replace(/"/g, '""')}"`;
        return [
          esc(new Date(r.createdAt).toISOString()),
          esc(r.userEmail),
          esc(r.action),
          esc(r.resource),
          esc(details),
          esc(r.ip),
          esc(r.hash),
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Printable PDF via new window (user can Save as PDF)
  const exportPDF = () => {
    const printableColumns = ["createdAt", "userEmail", "action", "resource", "details", "hash"];
    const html = `
      <html>
      <head>
        <title>Audit Logs</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; border: 1px solid #ddd; font-size: 12px; }
          th { background: #f3f4f6; text-align: left; }
          pre { white-space: pre-wrap; word-break: break-word; font-family: monospace; font-size: 11px; }
        </style>
      </head>
      <body>
        <h2>Audit Logs Export</h2>
        <p>Exported: ${new Date().toISOString()}</p>
        <table>
          <thead>
            <tr>
              ${printableColumns.map(c => `<th>${c}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>
              <td>${new Date(r.createdAt).toISOString()}</td>
              <td>${(r.userEmail||"")}</td>
              <td>${(r.action||"")}</td>
              <td>${(r.resource||"")}</td>
              <td><pre>${typeof r.details === "string" ? r.details : JSON.stringify(r.details || {}, null, 2)}</pre></td>
              <td>${r.hash || ""}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) { alert("Unable to open print window. Please allow popups."); return; }
    w.document.write(html);
    w.document.close();
    // give browser a moment to render then call print
    setTimeout(() => { w.print(); }, 500);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Audit Logs</h2>
            <div className="space-x-2">
              <button onClick={exportCSV} className="px-3 py-1 bg-slate-800 text-white rounded">Export CSV</button>
              <button onClick={exportPDF} className="px-3 py-1 bg-emerald-600 text-white rounded">Export PDF</button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <input
              type="text"
              placeholder="Filter by user email"
              className="p-2 border rounded"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by action (e.g. dataset.upload)"
              className="p-2 border rounded"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
            <input
              type="date"
              className="p-2 border rounded"
              value={from ? from.slice(0,10) : ""}
              onChange={(e) => setFrom(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            />
            <input
              type="date"
              className="p-2 border rounded"
              value={to ? to.slice(0,10) : ""}
              onChange={(e) => setTo(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            />
            <div className="flex space-x-2">
              <button onClick={onFilterApply} className="px-3 py-2 bg-cyan-500 text-white rounded">Apply</button>
              <button onClick={onClearFilters} className="px-3 py-2 bg-gray-200 rounded">Clear</button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left">Timestamp</th>
                  <th className="py-2 px-3 text-left">User</th>
                  <th className="py-2 px-3 text-left">Action</th>
                  <th className="py-2 px-3 text-left">Resource</th>
                  <th className="py-2 px-3 text-left">Details</th>
                  <th className="py-2 px-3 text-left">Hash</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-4">Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="p-4">No audit logs found</td></tr>
                ) : rows.map(r => (
                  <tr key={r._id} className="border-t">
                    <td className="py-2 px-3">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-3">{r.userEmail || "-"}</td>
                    <td className="py-2 px-3">{r.action}</td>
                    <td className="py-2 px-3">{r.resource || "-"}</td>
                    <td className="py-2 px-3"><pre className="whitespace-pre-wrap text-xs">{typeof r.details === "string" ? r.details : JSON.stringify(r.details || {}, null, 2)}</pre></td>
                    <td className="py-2 px-3 text-xs break-all">{r.hash || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div>
              Showing page {page} of {totalPages} — {total} records
            </div>
            <div className="space-x-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p-1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p+1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLogs;
