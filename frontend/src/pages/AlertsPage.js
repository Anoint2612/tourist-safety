import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api, endpoints } from "../services/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");

  useEffect(() => {
    let isMounted = true;
    api.get(endpoints.alerts).then(r => { if (isMounted) setAlerts(Array.isArray(r.data) ? r.data : []); });
    return () => { isMounted = false; };
  }, []);

  const rows = useMemo(() => {
    let r = alerts;
    if (severity !== "all") r = r.filter(a => (a.severity || "").toLowerCase() === severity);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(a => `${a.type} ${a.message}`.toLowerCase().includes(q));
    }
    return r;
  }, [alerts, query, severity]);

  const badgeClass = (sev) => {
    const s = (sev || "").toLowerCase();
    if (s === "high") return "badge high";
    if (s === "medium") return "badge medium";
    return "badge low";
  };

  return (
    <AdminLayout>
      <div className="panel">
        <div className="panel-header">Alerts</div>
        <div className="panel-body">
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Search type or message..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1, background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
            />
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
            >
              <option value="all">All severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Severity</th>
                <th>Message</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a._id}>
                  <td>{a.type || ""}</td>
                  <td><span className={badgeClass(a.severity)}>{a.severity || "low"}</span></td>
                  <td>{a.message || a.description}</td>
                  <td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}