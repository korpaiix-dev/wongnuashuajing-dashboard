"use client";
import RoleGate from "./RoleGate";

export default function Vault() {
  return (
    <RoleGate minRole="member" as="section" className="section ops-section">
      <div className="section-heading"><p className="eyebrow">Vault</p><h2>คลังและบัญชีแก๊ง</h2></div>
      <div className="metrics">
        <article className="metric-card"><span className="metric-icon">฿</span><p>เงินกองกลาง</p><strong>20,000</strong><small>mockup สำหรับต่อฐานข้อมูลจริง</small></article>
        <article className="metric-card"><span className="metric-icon">◆</span><p>ของในคลัง</p><strong>18</strong><small>อาวุธ / ยา / item กิจกรรม</small></article>
        <article className="metric-card"><span className="metric-icon">+</span><p>ฝากล่าสุด</p><strong>3</strong><small>รอเชื่อม Discord log</small></article>
        <article className="metric-card"><span className="metric-icon">-</span><p>เบิกล่าสุด</p><strong>1</strong><small>ต้องอนุมัติโดย Boss/เลขา</small></article>
      </div>
    </RoleGate>
  );
}
