import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { createEfir } from "../services/api";

export default function EFIRCreate() {
  const [filedBy, setFiledBy] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!filedBy || !phone || !description) {
      setError("Please fill all fields.");
      return;
    }
    setSubmitting(true);
    try {
      await createEfir({ filedBy, phone, description });
      setSuccess("E-FIR created successfully");
      setFiledBy("");
      setPhone("");
      setDescription("");
    } catch (_) {
      setError("Failed to create E-FIR. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="panel">
        <div className="panel-header">Create FIR</div>
        <div className="panel-body">
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label>Filed By</label>
              <input
                value={filedBy}
                onChange={(e) => setFiledBy(e.target.value)}
                placeholder="Name of complainant"
                style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contact number"
                style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident"
                rows={5}
                style={{ background: "#ffffff", color: "#0f172a", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
              />
            </div>
            {error ? <div style={{ color: "#f87171" }}>{error}</div> : null}
            {success ? <div style={{ color: "#34d399" }}>{success}</div> : null}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Create"}</button>
              <button className="btn" type="button" onClick={() => window.history.back()} style={{ background: "#374151" }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}


