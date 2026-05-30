"use client";
import { useStore } from "@/lib/store";
import { roleProfiles } from "@/lib/types";

export default function Topbar() {
  const activeRole = useStore((s) => s.activeRole);
  const profile = roleProfiles[activeRole];

  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Wongnuashuajing home">
        <span className="brand-mark image-mark">
          <img src="/assets/gang-emblem.png" alt="" />
        </span>
        <span>
          <strong>Wongnuashuajing</strong>
          <small>Women Gang OS</small>
        </span>
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <span>Main Menu</span>
        <a href="#dashboard">แดชบอร์ด</a>
        <a href="#members">สมาชิกแก๊ง</a>
        {profile.label !== "Member" && profile.label !== "Test Member" && profile.label !== "Register" && (
          <a href="#applications">Approvals</a>
        )}
        <a href="#ranking">Ranking Billboard</a>
        <span>Features</span>
        <a href="#leave">เช็คชื่อ / ขาดลา</a>
        <a href="#events">ภารกิจและนัดหมาย</a>
        <a href="#vault">คลังและบัญชี</a>
        <a href="#announcements">ประกาศ</a>
        <a href="#register">สมัครเข้าแก๊ง</a>
        <span>System</span>
        <a href="#logs">ประวัติการทำงาน</a>
        <a href="#profile">โปรไฟล์ส่วนตัว</a>
        <a href="#settings">ตั้งค่าระบบ</a>
      </nav>
      <div className="session-chip" aria-live="polite">
        <span className="session-dot"></span>
        <span>{profile.name}</span>
        <strong>{profile.label}</strong>
      </div>
      <button className="icon-btn" type="button" aria-label="เปิดเมนู">☰</button>
    </header>
  );
}
