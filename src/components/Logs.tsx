"use client";
import { useStore } from "@/lib/store";
import RoleGate from "./RoleGate";

export default function Logs() {
  const logs = useStore((s) => s.logs);
  return (
    <RoleGate minRole="secretary" as="section" className="section ops-section">
      <div className="section-heading"><p className="eyebrow">Activity Logs</p><h2>ประวัติการทำงาน</h2></div>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>Action</th><th>รายละเอียด</th></tr></thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}><td>{l.at}</td><td>{l.user}</td><td>{l.action}</td><td>{l.detail}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </RoleGate>
  );
}
