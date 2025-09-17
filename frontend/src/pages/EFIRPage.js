import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api, endpoints } from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "../marker-icon.png";

export default function EFIRPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [inspectors, setInspectors] = useState([]);
  const [assigning, setAssigning] = useState({}); // efirId -> inspectorId
  const [efirError, setEfirError] = useState("");
  const [inspectorsError, setInspectorsError] = useState("");
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'assigned'
  const [successMessage, setSuccessMessage] = useState("");

  const markerIcon = new L.Icon({
    iconUrl: markerIconPng,
    iconRetinaUrl: markerIconPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [0, 0]
  });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const efirRes = await api.get(endpoints.efirPending);
        if (isMounted) {
          setItems(Array.isArray(efirRes.data) ? efirRes.data : []);
          setEfirError("");
        }
      } catch (err) {
        if (isMounted) {
          setItems([]);
          setEfirError("Failed to load E-FIRs. Please refresh.");
        }
      }
      try {
        const inspRes = await api.get(endpoints.inspectors);
        if (isMounted) {
          setInspectors(Array.isArray(inspRes.data) ? inspRes.data : []);
          setInspectorsError("");
        }
      } catch (err) {
        if (isMounted) {
          setInspectors([]);
          setInspectorsError("Failed to load inspectors. Dropdown will be empty.");
        }
      }
      if (isMounted) setLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const verify = async (id) => {
    try {
      await api.post(endpoints.efirVerify(id));
      setItems(prev => prev.map(i => i._id === id ? { ...i, status: "verified" } : i));
    } catch (_) {}
  };
  const rejectFIR = async (id) => {
    try { await api.delete(endpoints.efirDelete(id)); } catch (_) {}
    setItems(prev => prev.filter(i => i._id !== id));
  };
  const assignOfficer = (id, inspectorId) => {
    setAssigning(prev => ({ ...prev, [id]: inspectorId }));
  };
  const doAssign = async (item) => {
    const inspectorId = assigning[item._id];
    const inspector = inspectors.find(x => String(x._id) === String(inspectorId));
    if (!inspectorId || !inspector) return;
    try {
      const r = await api.post(endpoints.efirAssign(item._id), { inspectorId, inspectorName: inspector.name });
      const updated = r.data;
      setItems(prev => prev.map(i => i._id === item._id ? updated : i));
      setSuccessMessage(`Case assigned to ${inspector.name} successfully.`);
      setActiveTab('assigned');
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (_) {}
  };
  const sendCopy = async (item) => {
    try {
      const r = await api.post(endpoints.efirSend(item._id));
      const updated = r.data;
      setItems(prev => prev.map(i => i._id === item._id ? updated : i));
    } catch (_) {}
  };

  const rows = useMemo(() => {
    const filteredByTab = items.filter(i => {
      if (activeTab === 'assigned') {
        return i.status === 'assigned' || i.status === 'sent';
      }
      // pending tab: exclude assigned and sent
      return i.status !== 'assigned' && i.status !== 'sent';
    });
    if (!query.trim()) return filteredByTab;
    const q = query.toLowerCase();
    return filteredByTab.filter(i => `${i.description} ${i.filedBy?.name || i.filedBy || ""}`.toLowerCase().includes(q));
  }, [items, query, activeTab]);

  return (
    <AdminLayout>
      <div className="panel">
        <div className="panel-header" style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, color: '#0f172a' }}>EFIR Management and Verification</div>
        <div className="panel-body">
          {successMessage ? (
            <div style={{
              background: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12
            }}>{successMessage}</div>
          ) : null}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              className="btn"
              onClick={() => setActiveTab('pending')}
              style={{ background: activeTab === 'pending' ? '#111827' : '#374151' }}
            >Pending FIRs</button>
            <button
              className="btn"
              onClick={() => setActiveTab('assigned')}
              style={{ background: activeTab === 'assigned' ? '#111827' : '#374151' }}
            >Assigned FIRs</button>
          </div>
          {(efirError || inspectorsError) ? (
            <div style={{
              background: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #FCD34D",
              padding: 10,
              borderRadius: 8,
              marginBottom: 12
            }}>
              {efirError ? <div>{efirError}</div> : null}
              {inspectorsError ? <div>{inspectorsError}</div> : null}
            </div>
          ) : null}
          <div style={{ height: 420, marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
            <MapContainer center={[26.2, 92.9]} zoom={6} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {rows
                .filter(i => i.geoLocation && typeof i.geoLocation.latitude === 'number' && typeof i.geoLocation.longitude === 'number')
                .map(i => (
                  <Marker key={i._id} position={[i.geoLocation.latitude, i.geoLocation.longitude]} icon={markerIcon}>
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <div style={{ fontWeight: 600 }}>{i.description}</div>
                        <div>Filed By: {i.filedBy?.name || i.filedBy || "—"}</div>
                        <div>Status: {i.status}</div>
                        {i.geoLocation?.nearestCity ? <div>Near: {i.geoLocation.nearestCity}</div> : null}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

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
                <th>Tourist ID</th>
                <th>Location</th>
                <th>Status</th>
                <th>{activeTab === 'assigned' ? 'Assigned officer' : 'Assign Officer'}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>
                    {loading ? 'Loading E-FIRs…' : 'No E-FIRs found'}
                  </td>
                </tr>
              )}
              {rows.map((i) => (
                <tr key={i._id}>
                  <td>{i.description}</td>
                  <td>{i.filedBy?.name || i.filedBy || "—"}</td>
                  <td>{i.phone || "—"}</td>
                  <td>{i.touristId || "—"}</td>
                  <td>{(i.geoLocation && typeof i.geoLocation.latitude === 'number' && typeof i.geoLocation.longitude === 'number') ? `${i.geoLocation.latitude}, ${i.geoLocation.longitude}` : "—"}</td>
                  <td>
                    {i.status}
                    {activeTab !== 'assigned' && i.assignedInspector?.name ? (
                      <div style={{ color: '#6b7280', fontSize: 12 }}>({i.assignedInspector.name})</div>
                    ) : null}
                  </td>
                  <td>
                    {activeTab === 'assigned' ? (
                      <div>{i.assignedInspector?.name || '—'}</div>
                    ) : (
                      <select
                        value={assigning[i._id] || ""}
                        onChange={(e)=>assignOfficer(i._id, e.target.value)}
                        style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
                      >
                        <option value="">Select officer</option>
                        {inspectors.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                      </select>
                    )}
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn" disabled={loading || i.status === 'assigned' || !assigning[i._id]} onClick={() => doAssign(i)}>
                      {i.status === 'assigned' ? 'Assigned' : 'Assign'}
                    </button>
                    <button className="btn" disabled={i.status === 'sent'} onClick={() => sendCopy(i)}>
                      {i.status === 'sent' ? 'Sent' : 'Send'}
                    </button>
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