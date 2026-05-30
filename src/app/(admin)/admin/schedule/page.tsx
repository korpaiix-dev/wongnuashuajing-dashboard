import { adminClient } from "@/lib/supabase";

export default async function SchedulePage() {
  const sb = adminClient();
  const { data: schedules } = await sb.from("schedules").select("*").order("time_of_day");

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Daily Reminders</p>
        <h1>ตั้งแจ้งเตือนรายวัน</h1>
        <p>ตั้งเวลาที่ bot จะแจ้งเตือนใน Discord (เช่น "20:30 เช็คชื่อก่อนเริ่มกิจกรรม")</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>ชื่อ</th><th>เวลา</th><th>วัน</th><th>Channel</th><th>สถานะ</th></tr></thead>
          <tbody>
            {(schedules ?? []).map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td><strong className="gold">{s.time_of_day}</strong></td>
                <td className="muted">{(s.days_of_week ?? []).map((d: number) => ["อา","จ","อ","พ","พฤ","ศ","ส"][d]).join(", ")}</td>
                <td className="muted" style={{ fontSize: 12, fontFamily: "monospace" }}>{s.channel_id.slice(-6)}…</td>
                <td><span className={`pill pill-${s.active ? "success" : ""}`}>{s.active ? "Active" : "Off"}</span></td>
              </tr>
            ))}
            {(!schedules || schedules.length === 0) && <tr><td colSpan={5}><div className="empty" style={{ margin: 12 }}>ยังไม่มี schedule</div></td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ marginTop: 16, fontSize: 12 }}>
        TODO: UI สร้าง/แก้ไข — เพิ่ม form กับ bot worker หลังเสร็จเฟส discord bot
      </p>
    </div>
  );
}
