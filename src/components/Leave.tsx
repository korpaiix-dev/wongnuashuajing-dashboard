"use client";
import { useState } from "react";
import { useStore, absenceScore } from "@/lib/store";

export default function Leave() {
  const members = useStore((s) => s.members);
  const leaveRequests = useStore((s) => s.leaveRequests);
  const submit = useStore((s) => s.submitLeave);
  const [form, setForm] = useState({ name: "Aheye", reason: "ติดธุระส่วนตัว ขอพัก 2 วัน", date: "30 May - 1 Jun" });

  return (
    <section className="section leave-section" id="leave">
      <div className="section-heading"><p className="eyebrow">Attendance & Leave</p><h2>ระบบจัดการ ขาด / ลา</h2></div>
      <div className="leave-grid">
        <form
          className="panel"
          onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return; submit(form); }}
        >
          <p className="eyebrow">LOA Request</p>
          <h3>ส่งคำขอลา</h3>
          <label>ชื่อสมาชิก<input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>เหตุผล<textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
          <label>ช่วงวันที่<input type="text" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <button className="primary-btn form-btn" type="submit">ส่งคำขอ</button>
        </form>
        <section className="panel panel-wide">
          <div className="panel-head"><div><p className="eyebrow">Absence Score</p><h3>คะแนนขาด / ลา</h3></div></div>
          <div className="absence-list">
            {members.map((m) => (
              <span key={m.id}>
                <b>{m.name}</b>
                <em>ลา {m.leave || 0} · ขาด {m.absent || 0} · Score {absenceScore(m)}</em>
              </span>
            ))}
            {leaveRequests.map((r) => (
              <span key={r.id} className="request-row">
                <b>{r.name} · {r.date}</b>
                <em>{r.status} · {r.reason}</em>
              </span>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
