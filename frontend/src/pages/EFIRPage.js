import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/api";

export default function EFIRPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient.nodeApi
      .get(apiClient.endpointsNode.efirPending)
      .then((r) => {
        if (!isMounted) return;
        setItems(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => { if (isMounted) setItems([]); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const verify = async (id) => {
    try { await apiClient.nodeApi.post(apiClient.endpointsNode.efirVerify(id)); } catch (_) {}
    setItems(prev => prev.filter(i => i._id !== id));
  };

  const rows = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(i => `${i.description} ${i.filedBy?.name || i.filedBy || ""}`.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <AdminLayout>
      <div className="panel">
        <div className="panel-header">E-FIR</div>
        <div className="panel-body">
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Search description or filer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1, background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Filed By</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>
                    {loading ? 'Loading E-FIRs…' : 'No E-FIRs found'}
                  </td>
                </tr>
              )}
              {rows.map((i) => (
                <tr key={i._id}>
                  <td>{i.description}</td>
                  <td>{i.filedBy?.name || i.filedBy || "—"}</td>
                  <td>{i.phone || "—"}</td>
                  <td>{i.status}</td>
                  <td>
                    <button className="btn" onClick={() => verify(i._id)}>Verify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}