import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "../marker-icon.png";

const sosIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

export default function MapView({ center = [26.2, 92.9], markers = [] }) {
  return (
    <MapContainer center={center} zoom={7} style={{ height: "500px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers.map((m) => {
        // Handle different data structures for location
        let lat, lng;
        if (m.geoLocation && m.geoLocation.coordinates) {
          // GeoJSON format: [lng, lat]
          lng = m.geoLocation.coordinates[0];
          lat = m.geoLocation.coordinates[1];
        } else if (m.geoLocation && m.geoLocation.lat && m.geoLocation.lng) {
          // Object format: {lat, lng}
          lat = m.geoLocation.lat;
          lng = m.geoLocation.lng;
        } else if (m.latitude && m.longitude) {
          // Direct properties
          lat = m.latitude;
          lng = m.longitude;
        } else {
          // Skip markers without valid coordinates
          return null;
        }

        return (
          <Marker
            key={m._id || m.id || JSON.stringify(m.geoLocation)}
            position={[lat, lng]}
            icon={sosIcon}
          >
            <Popup>
              <div>
                <strong>{m.type || m.alert_type || 'Alert'}</strong>
                <br />
                {m.message || m.description || 'No description'}
                <br />
                <small>Severity: {m.severity || 'Unknown'}</small>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}