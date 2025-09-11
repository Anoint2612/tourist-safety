import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/admin.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!name || !email || !password) throw new Error("Fill all fields");
      // Dummy signup: instantly "create" and login
      localStorage.setItem("admin_token", "dummy-jwt-token");
      navigate("/");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="panel" style={{ width: 420 }}>
        <div className="panel-header">Admin Sign Up</div>
        <div className="panel-body">
          {error ? <div style={{ color: "#991b1b", background: "#fee2e2", border: "1px solid var(--border)", padding: 8, borderRadius: 8, marginBottom: 8 }}>{error}</div> : null}
          <form onSubmit={onSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }} />
              <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }} />
              <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 10 }} />
              <button className="btn" disabled={loading} type="submit">{loading ? "Creating..." : "Create Account"}</button>
              <div style={{ color: "#9ca3af" }}>Have an account? <Link to="/login">Sign in</Link></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


