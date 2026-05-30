"use client";
import { useState } from "react";
import { useStore, statusClass, formatPoints } from "@/lib/store";
import { roleLabels, type Role } from "@/lib/types";
import RoleGate from "./RoleGate";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "boss", label: "Boss" },
  { value: "secretary", label: "เลขา" },
  { value: "member", label: "Member" },
  { value: "testmember", label: "Test" },
];

const DRIVE_ROSTER = ["Sixseven","Shion","Shabu","Rava","Nongmel","Namo","Muta","Mooping","Millfei","Mhoofah","Melfury","Mei","Maysa","Maprang","Lydia","Little","Kratom","Kitkat","Just","Jisoo","Jhanjaojah","Jay","Jaoyou","Jaiko","Honye","Hiyeen","Gyo","Freya","Chujai","Carli","Bunny","Aonvon","Anna","Alin","Aheye"];

export default function Members() {
  const members = useStore((s) => s.members);
  const activeFilter = useStore((s) => s.activeFilter);
  const setActiveFilter = useStore((s) => s.setActiveFilter);
  const memberQuery = useStore((s) => s.memberQuery);
  const setMemberQuery = useStore((s) => s.setMemberQuery);
  const upsertMember = useStore((s) => s.upsertMember);
  const removeMember = useStore((s) => s.removeMember);
  const promoteMember = useStore((s) => s.promoteMember);

  const [form, setForm] = useState({ name: "Aheye", discord: "@aheye", role: "member" as Role, status: "Online" });

  const filtered = members.filter((m) => {
    const rankMatch = activeFilter === "all" || m.role === activeFilter;
    const text = `${m.name} ${m.discord} ${m.status} ${m.activity}`.toLowerCase();
    return rankMatch && (!memberQuery || text.includes(memberQuery.toLowerCase()));
  });

  return (
    <section className="section members" id="members">
      <div className="section-heading row">
        <div><p className="eyebrow">Roster Control</p><h2>จัดการสมาชิก</h2></div>
        <div className="segmented" role="group" aria-label="Member filter">
          {FILTERS.map((f) => (
            <button key={f.value} className={activeFilter === f.value ? "active" : ""} type="button" onClick={() => setActiveFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="member-layout">
        <RoleGate minRole="secretary" as="section" className="panel">
          <div className="panel-head"><div><p className="eyebrow">New Member</p><h3>เพิ่ม / แก้ไขข้อมูล</h3></div></div>
          <form
            className="member-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name.trim()) return;
              upsertMember(form);
            }}
          >
            <label>ชื่อในเมือง<input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Discord<input type="text" value={form.discord} onChange={(e) => setForm({ ...form, discord: e.target.value })} /></label>
            <label>ยศ
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="boss">Boss</option>
                <option value="secretary">เลขา</option>
                <option value="member">Member</option>
                <option value="testmember">Test Member</option>
              </select>
            </label>
            <label>สถานะ
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Online</option><option>LOA</option><option>Inactive</option>
              </select>
            </label>
            <button className="primary-btn form-btn" type="submit">บันทึกสมาชิก</button>
          </form>
        </RoleGate>

        <RoleGate minRole="testmember" maxRole="member" as="section" className="panel member-self">
          <div className="panel-head"><div><p className="eyebrow">Member Workspace</p><h3>พื้นที่ของสมาชิก</h3></div></div>
          <div className="self-actions">
            <button className="small-btn" type="button">ลงชื่อกิจกรรม</button>
            <button className="small-btn" type="button">ส่งคำขอ LOA</button>
            <button className="small-btn" type="button">แก้โปรไฟล์ตัวเอง</button>
          </div>
          <p className="muted-copy">สมาชิกและ testmember เห็นข้อมูลทีมแบบจำกัด และแก้ได้เฉพาะข้อมูลของตัวเองเท่านั้น</p>
        </RoleGate>

        <RoleGate onlyRole="register" as="section" className="panel member-self register-only">
          <div className="panel-head"><div><p className="eyebrow">Waiting Approval</p><h3>รออนุมัติเข้าแก๊ง</h3></div></div>
          <p className="muted-copy">บัญชีนี้ยังไม่เป็นสมาชิกเต็มตัว จึงเห็นได้เฉพาะสถานะสมัครและประกาศสำหรับ Register</p>
          <button className="primary-btn form-btn" type="button">ดูสถานะใบสมัคร</button>
        </RoleGate>

        <RoleGate minRole="member" as="section" className="panel panel-wide">
          <div className="panel-head">
            <div><p className="eyebrow">Member List</p><h3>รายชื่อปัจจุบัน</h3></div>
            <input className="search" type="search" placeholder="ค้นหาชื่อ / Discord" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ชื่อ</th><th>ยศ</th><th>สถานะ</th><th>แต้ม</th><th>กิจกรรมล่าสุด</th>
                  <RoleGate minRole="secretary" as="th">จัดการ</RoleGate>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>{m.image ? (
                      <span className="member-name"><img src={m.image} alt="" /> {m.name}</span>
                    ) : (
                      <><span className="avatar">{m.name.charAt(0).toUpperCase()}</span> {m.name}</>
                    )}</td>
                    <td>{roleLabels[m.role] ?? m.role}</td>
                    <td><span className={`status ${statusClass(m.status)}`}>{m.status}</span></td>
                    <td>{formatPoints(m.points)}</td>
                    <td>{m.activity}</td>
                    <RoleGate minRole="secretary" as="td">
                      <button className="row-action" type="button" onClick={() => promoteMember(m.id)}>เลื่อนยศ</button>
                      <button className="row-action danger-action" type="button" onClick={() => removeMember(m.id)}>ลบ</button>
                    </RoleGate>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="drive-roster">
            {DRIVE_ROSTER.map((n) => <span key={n}>{n}</span>)}
          </div>
        </RoleGate>
      </div>
    </section>
  );
}
