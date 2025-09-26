import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import apiClient from "../services/api";

export default function PolicePage() {
  const [alerts, setAlerts] = useState([]);
  const [query, setQuery] = useState("");
  const [onlyUnresolved, setOnlyUnresolved] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Use Node.js API instead of FastAPI
    apiClient.nodeApi
      .get("/alerts")
      .then((r) => {
        if (!isMounted) return;
        const data = r.data;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.alerts) ? data.alerts : []);
        // Filter for unresolved alerts if needed
        const filteredList = onlyUnresolved ? list.filter(alert => !alert.is_resolved) : list;
        setAlerts(filteredList);
      })
      .catch(() => setAlerts([]));
    return () => { isMounted = false; };
  }, [onlyUnresolved]);

  const rows = useMemo(() => {
    let r = alerts;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(a => `${a.alert_type || a.type || ""} ${a.message || ""}`.toLowerCase().includes(q));
    }
    return r;
  }, [alerts, query]);

  const markResolved = (id) => {
    // For now, just update the local state since we don't have a PUT endpoint in Node.js API
    setAlerts(prev => prev.map(a => (a._id === id || a.id === id ? { ...a, is_resolved: true } : a)));
    // TODO: Add PUT endpoint to Node.js API for updating alerts
  };

  const badgeClass = (sev) => {
    const s = (sev || "").toLowerCase();
    if (s === "high_priority" || s === "high") return "badge high";
    if (s === "warning" || s === "medium") return "badge medium";
    return "badge low";
  };

  return (
    <AdminLayout>
      <div className="panel">
        <div className="panel-header">Police - Live Alerts</div>
        <div className="panel-body">
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <input
              placeholder="Search type or message..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1, background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
            />
            <label style={{ display: "flex", gap: 6, alignItems: "center", color: "#e5e7eb" }}>
              <input type="checkbox" checked={onlyUnresolved} onChange={(e) => setOnlyUnresolved(e.target.checked)} />
              Only unresolved
            </label>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Severity</th>
                <th>Message</th>
                <th>Assigned</th>
                <th>When</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id || a._id}>
                  <td>{a.alert_type || a.type || ""}</td>
                  <td><span className={badgeClass((a.alert_type || a.severity || "").toLowerCase())}>{a.alert_type || a.severity || "low"}</span></td>
                  <td>{a.message || a.description}</td>
                  <td>{a.assigned_station_name ? `Assigned to ${a.assigned_station_name}` : "Unassigned"}</td>
                  <td>{a.timestamp ? new Date(a.timestamp).toLocaleString() : a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</td>
                  <td>
                    {!a.is_resolved && (
                      <button className="btn" onClick={() => markResolved(a.id)}>
                        Mark Resolved
                      </button>
                    )}
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



