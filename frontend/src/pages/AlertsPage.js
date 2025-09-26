import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import MapView from "../components/MapView";
import apiClient from "../services/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [nearestMap, setNearestMap] = useState({});
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    // Fetch from Node API backend
    apiClient.nodeApi
      .get("/alerts")
      .then((r) => {
        if (!isMounted) return;
        const data = r.data;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.alerts) ? data.alerts : []);
        setAlerts(list);
      })
      .catch(() => setAlerts([]));
    return () => { isMounted = false; };
  }, []);

  const rows = useMemo(() => {
    let r = alerts;
    if (severity !== "all") {
      r = r.filter(a => {
        const sev = (a.alert_type || a.severity || "").toLowerCase();
        if (severity === "high") return sev === "high_priority" || sev === "high";
        if (severity === "medium") return sev === "warning" || sev === "medium";
        if (severity === "low") return sev === "low";
        return true;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(a => `${a.alert_type || a.type || ""} ${a.message || ""}`.toLowerCase().includes(q));
    }
    return r;
  }, [alerts, query, severity]);

  const badgeClass = (sev) => {
    const s = (sev || "").toLowerCase();
    if (s === "high_priority" || s === "high") return "badge high";
    if (s === "warning" || s === "medium") return "badge medium";
    return "badge low";
  };

  return (
    <AdminLayout>
      <div className="panel">
        <div className="panel-header">Alerts</div>
        <div className="panel-body">
          <div style={{ marginBottom: 12 }}>
            <MapView
              markers={alerts.map(a => ({
                ...a,
                geoLocation: a.geoLocation || (a.latitude && a.longitude ? { lat: a.latitude, lng: a.longitude } : undefined)
              }))}
            />
          </div>
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
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input placeholder="Type (e.g., Weather)" id="newType" style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }} />
            <select id="newSeverity" defaultValue="low" style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input placeholder="Message" id="newMessage" style={{ flex: 1, background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }} />
            <input placeholder="Lat" id="newLat" style={{ width: 120, background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }} />
            <input placeholder="Lng" id="newLng" style={{ width: 120, background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }} />
            <button className="btn" onClick={async () => {
              const type = document.getElementById("newType").value;
              const severityVal = document.getElementById("newSeverity").value;
              const message = document.getElementById("newMessage").value;
              const lat = parseFloat(document.getElementById("newLat").value);
              const lng = parseFloat(document.getElementById("newLng").value);
              if (!type || !message || Number.isNaN(lat) || Number.isNaN(lng)) {
                alert("Please fill type, message, lat and lng");
                return;
              }
              const payload = {
                type,
                severity: severityVal,
                message,
                geoLocation: { type: "Point", coordinates: [lng, lat] }
              };
              try {
                const r = await apiClient.nodeApi.post("/alerts", payload);
                setAlerts(prev => [r.data, ...prev]);
                document.getElementById("newType").value = "";
                document.getElementById("newMessage").value = "";
                document.getElementById("newLat").value = "";
                document.getElementById("newLng").value = "";
              } catch (e) {
                alert("Failed to create alert");
              }
            }}>Create Test Alert</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Severity</th>
                <th>Message</th>
                <th>When</th>
                <th>Nearest Police</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id || a._id}>
                  <td>{a.alert_type || a.type || ""}</td>
                  <td><span className={badgeClass((a.alert_type || a.severity || "").toLowerCase())}>{a.alert_type || a.severity || "low"}</span></td>
                  <td>{a.message || a.description}</td>
                  <td>{a.timestamp ? new Date(a.timestamp).toLocaleString() : a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</td>
                  <td>
                    {(() => {
                      const lat = a.latitude || (a.geoLocation?.coordinates ? a.geoLocation.coordinates[1] : null);
                      const lng = a.longitude || (a.geoLocation?.coordinates ? a.geoLocation.coordinates[0] : null);
                      const key = a.id || a._id;
                      const stations = nearestMap[key];
                      if (!lat || !lng) return <span style={{opacity:0.7}}>No location</span>;
                      if (!stations) {
                        apiClient.geoApi.get(apiClient.endpointsGeo.nearestStations(lat, lng))
                          .then(r => {
                            const list = r.data?.stations || [];
                            setNearestMap(prev => ({ ...prev, [key]: list }));
                          })
                          .catch(() => setNearestMap(prev => ({ ...prev, [key]: [] })));
                        return <span style={{opacity:0.7}}>Loading...</span>;
                      }
                      if (!stations.length) return <span style={{opacity:0.7}}>No stations found</span>;
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {stations.slice(0,3).map(s => (
                            <span key={s.id} style={{ whiteSpace: "nowrap" }}>{s.name}{s.phone ? ` (${s.phone})` : ""}</span>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {a.assigned_station_name ? (
                        <span className="badge" style={{ background: "#16a34a" }}>Assigned: {a.assigned_station_name}</span>
                      ) : (
                        <select
                          disabled={assigningId === (a.id || a._id)}
                          onChange={(e) => {
                            const stationId = e.target.value;
                            if (!stationId) return;
                            const id = a.id || a._id;
                            const station = (nearestMap[id] || []).find(s => s.id === stationId);
                            const stationName = station?.name || "Station";
                            setAssigningId(id);
                            apiClient.nodeApi.put(apiClient.endpointsNode.assignAlert(id), {
                              station_id: stationId,
                              station_name: stationName
                            })
                              .then((r) => {
                                const updated = r.data;
                                setAlerts(prev => prev.map(x => ((x.id === updated._id || x._id === updated._id) ? { ...x, ...updated } : x)));
                              })
                              .finally(() => setAssigningId(null));
                          }}
                          defaultValue=""
                          style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 6 }}
                        >
                          <option value="" disabled>
                            {assigningId === (a.id || a._id) ? "Assigning..." : "Assign to station"}
                          </option>
                          {(nearestMap[a.id || a._id] || []).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
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