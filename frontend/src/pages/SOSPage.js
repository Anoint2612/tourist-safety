import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import MapView from "../components/MapView";
import apiClient from "../services/api";

export default function SOSPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Fetch alerts from Node API backend
    apiClient.nodeApi
      .get("/alerts")
      .then((r) => {
        if (!isMounted) return;
        const data = r.data;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.alerts) ? data.alerts : []);
        setAlerts(list);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setAlerts([]);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const markers = useMemo(() => {
    return alerts.map(alert => ({
      ...alert,
      type: alert.type || "Alert",
      severity: alert.severity || "high"
    }));
  }, [alerts]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="panel">
          <div className="panel-header">SOS Map</div>
          <div className="panel-body">
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading alerts...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid">
        <div className="panel">
          <div className="panel-header">SOS Map</div>
          <div className="panel-body">
            <MapView 
              center={[13.030722, 77.565]} 
              zoom={10} 
              markers={markers} 
            />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Recent Alerts</div>
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert._id || alert.id}>
                    <td>{alert.type || alert.alert_type || "Alert"}</td>
                    <td>
                      <span className={`badge ${alert.severity === 'high' ? 'high' : alert.severity === 'medium' ? 'medium' : 'low'}`}>
                        {alert.severity || "Unknown"}
                      </span>
                    </td>
                    <td>{alert.message || alert.description || "No description"}</td>
                    <td>{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "Unknown"}</td>
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


