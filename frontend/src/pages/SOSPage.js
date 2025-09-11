import React, { useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import MapView from "../components/MapView";

const DUMMY_SOS = [
  { _id: "s1", touristId: "T1001", message: "Help needed near trail.", geoLocation: { lat: 26.20, lng: 92.90 }, timestamp: Date.now() - 1000*60*5 },
  { _id: "s2", touristId: "T1002", message: "Injury reported.", geoLocation: { lat: 26.35, lng: 93.10 }, timestamp: Date.now() - 1000*60*20 },
  { _id: "s3", touristId: "T1003", message: "Lost contact with group.", geoLocation: { lat: 26.00, lng: 92.60 }, timestamp: Date.now() - 1000*60*60 },
];

export default function SOSPage() {
  const markers = useMemo(() => DUMMY_SOS.map(s => ({ ...s, type: "SOS", severity: "high" })), []);
  return (
    <AdminLayout>
      <div className="grid">
        <div className="panel">
          <div className="panel-header">SOS Map</div>
          <div className="panel-body">
            <MapView markers={markers} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Recent SOS Requests</div>
          <div className="panel-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Tourist ID</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_SOS.map(s => (
                  <tr key={s._id}>
                    <td>{s.touristId}</td>
                    <td>{s.message}</td>
                    <td>{new Date(s.timestamp).toLocaleString()}</td>
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


