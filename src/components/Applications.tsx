"use client";
import { useStore } from "@/lib/store";
import RoleGate from "./RoleGate";

export default function Applications() {
  const applications = useStore((s) => s.applications);
  const approve = useStore((s) => s.approveApplication);

  return (
    <RoleGate minRole="secretary" as="section" className="section applications">
      <div className="section-heading"><p className="eyebrow">Register Review</p><h2>ข้อมูลที่ Register ส่งมา</h2></div>
      <div className="application-grid">
        {applications.length === 0 ? (
          <article className="application-card empty-state">
            <span className="avatar">✓</span>
            <div><h3>ไม่มีใบสมัครค้างอยู่</h3><p>เมื่อ Register ส่งโปรไฟล์ ระบบจะแสดงตรงนี้ให้ Boss/เลขารีวิว</p></div>
          </article>
        ) : (
          applications.map((app) => (
            <article key={app.id} className="application-card">
              <span className="avatar">{app.name.charAt(0).toUpperCase()}</span>
              <div>
                <h3>{app.name}</h3>
                <p>{app.discord} · เล่นได้ {app.time} · สถานะ {app.status}</p>
                <p>{app.reason}</p>
              </div>
              <button className="row-action" type="button" onClick={() => approve(app.id)}>รับเป็น Test Member</button>
            </article>
          ))
        )}
      </div>
    </RoleGate>
  );
}
