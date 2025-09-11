import React from "react";
import "../styles/admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <div className="main" style={{ marginLeft: 0 }}>
        <header className="topbar">
          <div className="topbar-title">Admin Panel</div>
          <div className="topbar-actions">
            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem("admin_token");
                window.location.href = "/login";
              }}
            >Logout</button>
          </div>
        </header>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}


