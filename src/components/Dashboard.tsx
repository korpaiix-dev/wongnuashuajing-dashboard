"use client";
import { useStore } from "@/lib/store";
import { roleProfiles } from "@/lib/types";
import RoleGate from "./RoleGate";

export default function Dashboard() {
  const activeRole = useStore((s) => s.activeRole);
  const profile = roleProfiles[activeRole];

  return (
    <section className="section dashboard" id="dashboard">
      <div className="section-heading">
        <p className="eyebrow">Command Center</p>
        <h2>แดชบอร์ดภาพรวมแก๊ง</h2>
        <p className="role-note">{profile.note}</p>
      </div>
      <div className="metrics">
        <article className="metric-card"><span className="metric-icon">♛</span><p>สมาชิกทั้งหมด</p><strong>34</strong><small>เพิ่มใหม่ 3 คนในสัปดาห์นี้</small></article>
        <article className="metric-card"><span className="metric-icon">●</span><p>ออนไลน์ตอนนี้</p><strong>18</strong><small className="success">พร้อมลงกิจกรรม 11 คน</small></article>
        <article className="metric-card"><span className="metric-icon">◆</span><p>กิจกรรมเปิดอยู่</p><strong>7</strong><small>ปล้น / ประชุม / ฝึกยิง</small></article>
        <RoleGate minRole="secretary" as="article" className="metric-card">
          <span className="metric-icon">!</span><p>คำขอรอดำเนินการ</p><strong>5</strong><small className="danger">LOA 2 / สมัคร 3</small>
        </RoleGate>
      </div>

      <div className="management-grid">
        <section className="panel panel-wide">
          <div className="panel-head">
            <div><p className="eyebrow">Operations</p><h3>กิจกรรมล่าสุด</h3></div>
            <RoleGate minRole="secretary" as="button" className="small-btn">+ เพิ่มกิจกรรม</RoleGate>
          </div>
          <div className="timeline">
            <article><time>20:30</time><div><strong>ประชุมแก๊งประจำสัปดาห์</strong><p>สถานะ: เปิดรับลงชื่อ | ผู้รับผิดชอบ: Just</p></div><span className="status open">เปิด</span></article>
            <article><time>22:00</time><div><strong>Convoy Training</strong><p>เตรียมรถ 4 คัน / คนคุมทาง 2 คน</p></div><span className="status warn">เตรียมตัว</span></article>
            <article><time>23:45</time><div><strong>War Log Review</strong><p>สรุปแต้ม MVP และรายการบาดเจ็บ</p></div><span className="status done">สรุปผล</span></article>
          </div>
        </section>

        <aside className="panel">
          <div className="panel-head"><div><p className="eyebrow">My Access</p><h3>สิทธิ์ที่ใช้งานได้</h3></div></div>
          <div className="access-list">
            {profile.access.map((item, i) => (
              <span key={item}><b>{item}</b><em>{i + 1}</em></span>
            ))}
          </div>
        </aside>
      </div>

      <div className="visual-command">
        <div className="visual-frame">
          <img src="/assets/gang-hero.png" alt="Wongnuashuajing official gang visual" />
        </div>
        <div className="boss-card">
          <img src="/assets/gang-hero.png" alt="Wongnuashuajing official visual crop" />
          <div>
            <p className="eyebrow">Official Visual</p>
            <h3>ใช้ภาพแก๊งจริงเป็นหน้าหลัก</h3>
            <p>เอาภาพตัวอย่างนี้ไปใช้เป็น visual หลักของระบบ ทั้งหน้าแรก โปรไฟล์ และประกาศกิจกรรม</p>
          </div>
        </div>
      </div>
    </section>
  );
}
