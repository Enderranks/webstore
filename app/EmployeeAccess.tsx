"use client";

import { FormEvent, useEffect, useState } from "react";

export type EmployeeSession = {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string | null;
  level?: string | null;
  allowanceCents: number;
  usedCents: number;
  remainingCents: number;
  expiresAt?: string | null;
};

const SESSION_KEY = "underline.employee";

export function readEmployeeSession(): EmployeeSession | null {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as EmployeeSession) : null;
  } catch {
    return null;
  }
}

export default function EmployeeAccess() {
  const [session, setSession] = useState<EmployeeSession | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setSession(readEmployeeSession()), []);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/employee/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, companyEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to verify employee.");
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setSession(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to verify employee.");
    } finally {
      setLoading(false);
    }
  }

  if (session) {
    const percentage = session.allowanceCents ? Math.min(100, Math.round((session.usedCents / session.allowanceCents) * 100)) : 0;
    return <div className="card" style={{ padding: 24, minWidth: 250 }}>
      <div className="eyebrow">Your 2026 allowance</div>
      <div style={{ fontSize: 38, fontWeight: 800, margin: "10px 0 4px" }}>${(session.allowanceCents / 100).toFixed(2)}</div>
      <div className="muted">${(session.remainingCents / 100).toFixed(2)} remaining</div>
      <div style={{ height: 8, borderRadius: 99, background: "#31302c", marginTop: 18, overflow: "hidden" }}><div style={{ width: `${percentage}%`, height: "100%", background: "var(--gold)" }} /></div>
      <div className="muted" style={{ fontSize: 12, marginTop: 9 }}>{percentage}% used · {session.firstName} {session.lastName}</div>
    </div>;
  }

  return <form className="card" onSubmit={verify} style={{ padding: 24, minWidth: 300, maxWidth: 360 }}>
    <div className="eyebrow">Employee access</div>
    <p className="muted" style={{ margin: "10px 0 16px" }}>Use your employee ID and company email to view your allowance.</p>
    <label className="muted" style={{ display: "block", fontSize: 13 }}>Employee ID<input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} required /></label>
    <label className="muted" style={{ display: "block", fontSize: 13, marginTop: 12 }}>Company email<input type="email" value={companyEmail} onChange={(event) => setCompanyEmail(event.target.value)} required /></label>
    {message && <div role="alert" style={{ color: "#ef9b83", fontSize: 13, marginTop: 12 }}>{message}</div>}
    <button className="button" type="submit" disabled={loading} style={{ marginTop: 16 }}>{loading ? "Checking…" : "View allowance"}</button>
  </form>;
}
