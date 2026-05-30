"use client";
import RoleGate from "./RoleGate";

export default function Announcements() {
  return (
    <RoleGate minRole="member" as="section" className="section ops-section">
      <div className="section-heading"><p className="eyebrow">Announcements</p><h2>ประกาศแก๊ง</h2></div>
      <div className="timeline">
        <article><time>Today</time><div><strong>ประชุมแก๊ง 20:30</strong><p>เช็กชื่อก่อนเริ่มกิจกรรม 10 นาที</p></div><span className="status warn">Pinned</span></article>
        <article><time>Week</time><div><strong>เปิดรับ Test Member</strong><p>ให้ Register ส่งโปรไฟล์ผ่านหน้า Join Us</p></div><span className="status open">Open</span></article>
      </div>
    </RoleGate>
  );
}
