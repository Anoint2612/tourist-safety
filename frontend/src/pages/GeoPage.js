import React, { useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DUMMY_CHECKPOINTS = [
  { id: "cp1", name: "Checkpoint A", lat: 26.20, lng: 92.90, tourists: 120 },
  { id: "cp2", name: "Checkpoint B", lat: 26.35, lng: 93.10, tourists: 70 },
  { id: "cp3", name: "Checkpoint C", lat: 26.00, lng: 92.60, tourists: 30 },
  { id: "cp4", name: "Checkpoint D", lat: 26.45, lng: 92.80, tourists: 200 },
];

const DUMMY_AI_ALERTS = [
  { id: "a1", type: "Weather", message: "Heavy rain expected within 2 hours", severity: "medium", area: "Checkpoint B vicinity", time: Date.now() - 1000*60*15 },
  { id: "a2", type: "Anomaly", message: "Landslide risk detected", severity: "high", area: "Checkpoint D route", time: Date.now() - 1000*60*40 },
];

export default function GeoPage() {
  const center = useMemo(() => [26.2, 92.9], []);
  return (
    <AdminLayout>
      <div className="grid">
        <div className="panel">
          <div className="panel-header">Tourist Density Map</div>
          <div className="panel-body" style={{ height: 520 }}>
            <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {DUMMY_CHECKPOINTS.map(cp => {
                const color = cp.tourists < 300 ? "#86efac" : (cp.tourists <= 600 ? "#fde047" : "#f87171");
                return (
                <Circle
                  key={cp.id}
                  center={[cp.lat, cp.lng]}
                  radius={Math.max(500, cp.tourists * 5)}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.25 }}
                />
                );
              })}
            </MapContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, background: "#86efac", borderRadius: 3 }} />
                <span style={{ color: "#e5e7eb", fontWeight: 600 }}>&lt; 300</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, background: "#fde047", borderRadius: 3 }} />
                <span style={{ color: "#e5e7eb", fontWeight: 600 }}>300 - 600</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, background: "#f87171", borderRadius: 3 }} />
                <span style={{ color: "#e5e7eb", fontWeight: 600 }}>600+</span>
              </div>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">AI Alerts</div>
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Area</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_AI_ALERTS.map(a => (
                  <tr key={a.id}>
                    <td>{a.type}</td>
                    <td><span className={`badge ${a.severity}`}>{a.severity}</span></td>
                    <td>{a.area}</td>
                    <td>{a.message}</td>
                    <td>{new Date(a.time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


