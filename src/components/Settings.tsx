"use client";
import RoleGate from "./RoleGate";

export default function Settings() {
  return (
    <RoleGate minRole="boss" as="section" className="section ops-section">
      <div className="section-heading"><p className="eyebrow">System Settings</p><h2>ตั้งค่าระบบ</h2></div>
      <form className="panel register-form">
        <label>ชื่อแก๊ง<input type="text" defaultValue="Wongnuashuajing" /></label>
        <label>Discord Webhook URL<input type="text" placeholder="จะใส่ตอนต่อ backend จริง" /></label>
        <label>คำอธิบายแก๊ง<textarea defaultValue="Women Gang OS สำหรับ FiveM" /></label>
        <button className="primary-btn form-btn" type="button">บันทึกการตั้งค่า</button>
      </form>
    </RoleGate>
  );
}
