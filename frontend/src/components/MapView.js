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
      {markers.map((m) => (
        <Marker
          key={m._id || JSON.stringify(m.geoLocation)}
          position={[
            m.geoLocation.coordinates
              ? m.geoLocation.coordinates[1]
              : m.geoLocation.lat,
            m.geoLocation.coordinates
              ? m.geoLocation.coordinates[0]
              : m.geoLocation.lng,
          ]}
          icon={sosIcon}
        >
          <Popup>{m.message || m.description}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}