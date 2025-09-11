import React from "react";
import AdminLayout from "../components/AdminLayout";
import FloatingMenu from "../components/FloatingMenu";
import ndrfLogo from "../ndrf_India_png.png";

export default function Dashboard() {
  return (
    <AdminLayout>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingTop: 24 }}>
        <img src={ndrfLogo} alt="NDRF" style={{ height: 160, width: "auto" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 360, width: "100%" }}>
          <FloatingMenu center large />
        </div>
      </div>
    </AdminLayout>
  );
}