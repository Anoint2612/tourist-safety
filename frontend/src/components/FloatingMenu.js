import React from "react";
import { useNavigate } from "react-router-dom";

const baseItemStyle = {
  background: "#e0f2fe",
  border: "1px solid #bae6fd",
  color: "#0c4a6e",
  padding: 12,
  borderRadius: 16,
  cursor: "pointer",
  transition: "transform 160ms ease, box-shadow 160ms ease",
  textAlign: "center",
};

export default function FloatingMenu({ center = false, large = false }) {
  const navigate = useNavigate();
  const go = (path) => () => navigate(path);
  const containerStyle = center
    ? { position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginTop: 40, gap: 16 }
    : { position: "fixed", right: 16, bottom: 16, display: "flex", gap: 12, zIndex: 1000 };
  const itemStyle = large
    ? { ...baseItemStyle, padding: 28, fontSize: 20, minWidth: 220, minHeight: 110 }
    : baseItemStyle;
  return (
    <div style={containerStyle}>
      <div onClick={go("/sos")} style={itemStyle} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(2,132,199,.35)';}} onMouseLeave={(e)=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='';}}>
        SOS Alerts
      </div>
      <div onClick={go("/efir")} style={itemStyle} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(2,132,199,.35)';}} onMouseLeave={(e)=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='';}}>
        E-FIR
      </div>
      <div onClick={go("/geo")} style={itemStyle} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(2,132,199,.35)';}} onMouseLeave={(e)=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='';}}>
        Geo-Fencing
      </div>
    </div>
  );
}


