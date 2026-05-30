"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function Register() {
  const submit = useStore((s) => s.submitApplication);
  const [form, setForm] = useState({
    name: "Shion",
    discord: "@shion",
    time: "20:00 - 01:00",
    experience: "เคยเล่นสายแก๊งและช่วยกิจกรรมทีมได้",
    reason: "ชอบบรรยากาศแก๊งผู้หญิงล้วนและอยากเล่นกับทีมจริงจัง",
  });

  return (
    <section className="section register-section" id="register">
      <div className="section-heading row">
        <div><p className="eyebrow">Gang Register</p><h2>ส่งโปรไฟล์สมัครเข้าแก๊ง</h2></div>
        <span className="badge">Discord OAuth required</span>
      </div>
      <div className="register-grid">
        <form
          className="panel register-form"
          onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return; submit(form); }}
        >
          <label>ชื่อในเมือง<input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Discord<input type="text" value={form.discord} onChange={(e) => setForm({ ...form, discord: e.target.value })} /></label>
          <label>เวลาที่เล่นได้<input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
          <label>ประสบการณ์ FiveM<textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label>
          <label>เหตุผลที่อยากเข้า<textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
          <button className="primary-btn form-btn" type="submit">ส่งใบสมัคร</button>
        </form>
        <div className="register-visual">
          <img src="/assets/operations-art.png" alt="Register and operations visual" />
          <div>
            <p className="eyebrow">Register Status</p>
            <h3>Pending Interview</h3>
            <p>หลังส่งใบสมัคร เลขา/Boss จะเห็นข้อมูลในหน้า Review Register เพื่ออนุมัติเป็น Test Member</p>
          </div>
        </div>
      </div>
    </section>
  );
}
