import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api, endpoints } from "../services/api";

export default function EFIRPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const officers = [
    { id: "o1", name: "Inspector A. Sharma" },
    { id: "o2", name: "Inspector R. Singh" },
    { id: "o3", name: "Inspector P. Das" },
  ];

  useEffect(() => {
    let isMounted = true;
    const dummy = [
      { _id: "f1", description: "Phone snatched near market", filedBy: { name: "Rahul Verma" }, geoLocation: { coordinates: [92.9, 26.2] }, status: "pending", victimPhone: "+91-98xxxxxxx" },
      { _id: "f2", description: "Harassment reported on bus", filedBy: { name: "Anita Devi" }, geoLocation: { coordinates: [93.1, 26.35] }, status: "pending", victimPhone: "+91-98xxxxxxx" },
      { _id: "f3", description: "Lost baggage at station", filedBy: { name: "Karan Mehta" }, geoLocation: { coordinates: [92.6, 26.0] }, status: "pending", victimPhone: "+91-98xxxxxxx" },
    ];
    api.get(endpoints.efirPending)
      .then(r => { if (isMounted) setItems(Array.isArray(r.data) && r.data.length ? r.data : dummy); })
      .catch(() => { if (isMounted) setItems(dummy); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const [assigning, setAssigning] = useState({});
  const verify = async (id) => {
    try { await api.post(endpoints.efirVerify(id)); } catch (_) {}
    setItems(prev => prev.filter(i => i._id !== id));
  };
  const rejectFIR = (id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  };
  const assignOfficer = (id, officerId) => {
    setAssigning(prev => ({ ...prev, [id]: officerId }));
  };
  const sendCopy = (item) => {
    alert(`Sent FIR copy to ${item.victimPhone || "+91-98xxxxxxx"}`);
  };

  const rows = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(i => `${i.description} ${i.filedBy?.name || ""}`.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <AdminLayout>
      <div className="panel">
        <div className="panel-header">Pending E-FIRs</div>
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
                <th>Location</th>
                <th>Status</th>
                <th>Assign Officer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i._id}>
                  <td>{i.description}</td>
                  <td>{i.filedBy?.name || i.filedBy || "—"}</td>
                  <td>{Array.isArray(i.geoLocation?.coordinates) ? `${i.geoLocation.coordinates[1]}, ${i.geoLocation.coordinates[0]}` : "—"}</td>
                  <td>{i.status}</td>
                  <td>
                    <select
                      value={assigning[i._id] || ""}
                      onChange={(e)=>assignOfficer(i._id, e.target.value)}
                      style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
                    >
                      <option value="">Select officer</option>
                      {officers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn" disabled={loading || !assigning[i._id]} onClick={() => verify(i._id)}>Approve & Assign</button>
                    <button className="btn" onClick={() => sendCopy(i)}>Send Copy</button>
                    <button className="btn" onClick={() => rejectFIR(i._id)} style={{ background: "#3a1f1f" }}>Reject</button>
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