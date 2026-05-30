"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[app error]", error); }, [error]);
  return (
    <div className="landing">
      <div className="landing-card">
        <div style={{ fontSize: 48, color: "var(--gold)", fontFamily: "Playfair Display, serif", fontWeight: 700, marginBottom: 8 }}>!</div>
        <h2 style={{ marginBottom: 8 }}>เกิดข้อผิดพลาด</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>{error.message || "ระบบมีปัญหาชั่วคราว ลองอีกครั้งครับ"}</p>
        {error.digest && <small className="muted" style={{ display: "block", marginBottom: 18 }}>ref: {error.digest}</small>}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={reset} className="btn btn-primary">ลองอีกครั้ง</button>
          <a href="/dashboard" className="btn btn-ghost">กลับ Dashboard</a>
        </div>
      </div>
    </div>
  );
}
