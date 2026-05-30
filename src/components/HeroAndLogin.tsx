"use client";
import { useStore } from "@/lib/store";
import { roleProfiles, type Role } from "@/lib/types";

const ROLES: Role[] = ["boss", "secretary", "member", "testmember", "register"];

const ROLE_DESCRIPTIONS: Record<Role, { sub: string }> = {
  boss: { sub: "คุมทุกระบบ" },
  secretary: { sub: "ช่วยจัดการระบบ" },
  member: { sub: "ใช้งานส่วนตัว" },
  testmember: { sub: "ช่วงทดลองงาน" },
  register: { sub: "รออนุมัติ" },
};

export default function HeroAndLogin() {
  const activeRole = useStore((s) => s.activeRole);
  const setActiveRole = useStore((s) => s.setActiveRole);
  const profile = roleProfiles[activeRole];

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-bg" role="img" aria-label="Wongnuashuajing gang hero image"></div>
        <div className="hero-shade"></div>
        <div className="hero-content">
          <p className="eyebrow">Luxury Mafia Management</p>
          <h1>WONGNUASHUAJING</h1>
          <p className="hero-copy">
            ระบบจัดการสมาชิก กิจกรรม โปรไฟล์ และสถานะแก๊งผู้หญิงล้วนใน FiveM ในหน้าควบคุมเดียว สำหรับหัวหน้าและทีมบริหารแก๊ง
          </p>
          <div className="hero-actions">
            <a className="primary-btn" href="#dashboard">เปิดหน้าแดชบอร์ด</a>
            <a className="ghost-btn" href="#login">เข้าสู่ระบบสมาชิก</a>
          </div>
        </div>
        <div className="hero-ticker" aria-label="Gang status summary">
          <span>MEMBERS 34</span>
          <span>ONLINE 18</span>
          <span>EVENTS 7</span>
          <span>WAR LOG 12</span>
        </div>
      </section>

      <section className="section login-section" id="login">
        <div className="login-panel">
          <div>
            <p className="eyebrow">Discord Role Login</p>
            <h2>เข้าสู่ระบบตามยศ</h2>
            <p>
              ตัวอย่างนี้จำลองการ Login ด้วย Discord OAuth: ระบบจะเช็ก Discord ID กับรายชื่อสมาชิก แล้วเปิดสิทธิ์ตามยศจริงของคนนั้น
            </p>
          </div>
          <div className="role-switcher" role="group" aria-label="Role preview">
            {ROLES.map((r) => (
              <button
                key={r}
                className={activeRole === r ? "active" : ""}
                type="button"
                onClick={() => setActiveRole(r)}
              >
                <span>{roleProfiles[r].label}</span>
                <small>{ROLE_DESCRIPTIONS[r].sub}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="permission-grid">
          <article className="permission-card"><span className="metric-icon">♛</span><h3>Boss</h3><p>จัดการสมาชิก เปลี่ยนยศ อนุมัติคำขอ ดู audit log และตั้งค่าระบบ</p></article>
          <article className="permission-card"><span className="metric-icon">◇</span><h3>เลขา</h3><p>สร้างกิจกรรม เช็กชื่อ อนุมัติ LOA และช่วยอัปเดตข้อมูลสมาชิก</p></article>
          <article className="permission-card"><span className="metric-icon">●</span><h3>Member</h3><p>ดูโปรไฟล์ตัวเอง ลงชื่อกิจกรรม ส่ง LOA และติดตามแต้มของตัวเอง</p></article>
          <article className="permission-card"><span className="metric-icon">T</span><h3>Test Member</h3><p>ลงชื่อกิจกรรมและส่งโปรไฟล์ได้ แต่ยังถูกจำกัดการเข้าถึงบางส่วน</p></article>
          <article className="permission-card"><span className="metric-icon">+</span><h3>Register</h3><p>กรอกใบสมัคร ดูสถานะสัมภาษณ์ และรอแอดมินอนุมัติเข้าสู่แก๊ง</p></article>
        </div>
      </section>
    </>
  );
}
