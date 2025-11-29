// frontend/src/pages/CreatePolicy.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Template = {
  id: string;
  name: string;
  description?: string;
  fields: any[];
  recommended?: { k?: number; l?: number; epsilon?: number };
};

const CreatePolicy: React.FC = () => {
  const { auth } = useAuth();
  const token = auth.token;
  const navigate = useNavigate();
  const { id: datasetId } = useParams<{ id: string }>();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [policyName, setPolicyName] = useState("");
  const [fields, setFields] = useState<any[]>([]);
  const [k, setK] = useState<number>(2);
  const [l, setL] = useState<number>(1);
  const [epsilon, setEpsilon] = useState<number>(0.1);

  // if editing existing policy scenario, we'll load versions
  const [policyId, setPolicyId] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/policies/templates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemplates(res.data || []);
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    };
    if (token) loadTemplates();
  }, [token]);

  // Apply template to the form
  const applyTemplate = (tmplId?: string) => {
    if (!tmplId) {
      setFields([]);
      return;
    }
    const tmpl = templates.find(t => t.id === tmplId);
    if (!tmpl) return;
    setSelectedTemplate(tmplId);
    setPolicyName(`${tmpl.name} - ${datasetId || "policy"}`);
    setFields(tmpl.fields.map(f => ({ ...f })));
    if (tmpl.recommended) {
      if (tmpl.recommended.k) setK(tmpl.recommended.k);
      if (tmpl.recommended.l) setL(tmpl.recommended.l);
      if (typeof tmpl.recommended.epsilon !== "undefined") setEpsilon(tmpl.recommended.epsilon);
    }
  };

  // field editors
  const updateField = (idx: number, key: string, value: any) => {
    setFields(prev => prev.map((f,i) => i===idx ? { ...f, [key]: value } : f));
  };

  const addField = () => setFields(prev => [...prev, { name: "", maskType: "pseudonymize", generalizationLevel: "medium" }]);
  const removeField = (idx: number) => setFields(prev => prev.filter((_,i)=>i!==idx));

  const onSave = async () => {
    try {
      if (!datasetId) return alert("Dataset ID missing from the route");
      if (!policyName) return alert("Policy name required");
      // create new policy
      const payload = { datasetId, policyName, fields, k, l, epsilon };
      const res = await axios.post(`${API_URL}/api/policies`, payload, { headers: { Authorization: `Bearer ${token}` }});
      alert("Policy created");
      navigate("/dashboard");
    } catch (err:any) {
      console.error("create policy failed", err);
      alert("Failed to create policy: " + (err.response?.data?.message || err.message));
    }
  };

  // Optional: fetch versions for editing a policy (if you later support editing)
  const loadVersions = async (policyIdToLoad: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/policies/${policyIdToLoad}/versions`, { headers: { Authorization: `Bearer ${token}` }});
      setVersions([res.data.current, ...(res.data.history || [])].reverse()); // newest first
    } catch (err) {
      console.error("Failed to load versions", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-2xl font-bold mb-4">Create Policy</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Choose Template</label>
            <select className="p-2 border rounded w-full" value={selectedTemplate || ""} onChange={e => applyTemplate(e.target.value || undefined)}>
              <option value="">-- No template (manual) --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTemplate && (
              <div className="text-sm text-gray-600 mt-2">
                Using template: {templates.find(t=>t.id===selectedTemplate)?.description}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Policy Name</label>
              <input value={policyName} onChange={e=>setPolicyName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">k-anonymity (k)</label>
              <input type="number" value={k} onChange={e=>setK(Number(e.target.value))} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">l-diversity (l)</label>
              <input type="number" value={l} onChange={e=>setL(Number(e.target.value))} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Epsilon (differential privacy)</label>
              <input type="number" step="0.01" value={epsilon} onChange={e=>setEpsilon(Number(e.target.value))} className="w-full p-2 border rounded" />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Fields</h3>
            <div className="space-y-3">
              {fields.map((f, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                  <input className="p-2 border rounded col-span-2" placeholder="Field name" value={f.name} onChange={e=>updateField(idx,"name",e.target.value)} />
                  <select value={f.maskType} onChange={e=>updateField(idx,"maskType",e.target.value)} className="p-2 border rounded">
                    <option value="pseudonymize">Pseudonymize</option>
                    <option value="generalize">Generalize</option>
                    <option value="suppress">Suppress</option>
                    <option value="tokenize">Tokenize</option>
                  </select>
                  <select value={f.generalizationLevel || "medium"} onChange={e=>updateField(idx,"generalizationLevel",e.target.value)} className="p-2 border rounded">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <div>
                    <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={()=>removeField(idx)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button className="px-4 py-2 bg-cyan-500 text-white rounded" onClick={addField}>Add Field</button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={onSave}>Save Policy</button>
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>navigate("/dashboard")}>Cancel</button>
          </div>

          {/* Version history (if editing) */}
          {policyId && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Policy Versions</h3>
              <div className="bg-gray-50 p-3 rounded">
                {versions.length === 0 ? <div>No versions</div> : (
                  <ul>
                    {versions.map((v:any, i:number) => (
                      <li key={i} className="border-b py-2">
                        <div className="text-sm font-semibold">Version {v.version} • {new Date(v.createdAt).toLocaleString()}</div>
                        <div className="text-xs text-gray-700">{v.k}-k, {v.l}-l, ε={v.epsilon}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CreatePolicy;
