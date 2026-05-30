import { adminClient } from "@/lib/supabase";
import { createTemplate, toggleTemplate, deleteTemplate } from "@/server-actions/templates";
import { eventLabels, type EventType } from "@/lib/types";
import SubmitButton from "@/components/SubmitButton";
import ConfirmSubmit from "@/components/ConfirmSubmit";

const DOW_LABEL = ["อา","จ","อ","พ","พฤ","ศ","ส"];
const DOW_FULL = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];

// HTML pattern — uses [0-9] instead of \d to avoid escape hell
const TIME_PATTERN = "^([01]?[0-9]|2[0-3]):[0-5][0-9]([ ]*,[ ]*([01]?[0-9]|2[0-3]):[0-5][0-9])*$";

export default async function SchedulePage() {
  const sb = adminClient();
  const { data: templates } = await sb.from("event_templates").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Recurring Events</p>
        <h1>กิจกรรมวนซ้ำอัตโนมัติ</h1>
        <p>ตั้งครั้งเดียว ระบบจะสร้าง event + broadcast Discord ทุกครั้งที่ถึงเวลาเอง</p>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 24 }}>
        <h3>เพิ่มเทมเพลตใหม่</h3>
        <form action={createTemplate} className="form" style={{ marginTop: 14 }}>
          <div className="grid grid-2">
            <div className="form-row">
              <label>ประเภท</label>
              <select name="type" defaultValue="airdrop">
                {(Object.keys(eventLabels) as EventType[]).map((k) => (
                  <option key={k} value={k}>{eventLabels[k]}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>ชื่อกิจกรรม</label>
              <input name="title" required maxLength={100} placeholder='เช่น "Airdrop ตู้"' />
            </div>
          </div>
          <div className="form-row">
            <label>เวลาในวัน (รูปแบบ HH:MM คั่นด้วย comma)</label>
            <input
              name="times"
              required
              pattern={TIME_PATTERN}
              placeholder="14:00, 18:00, 22:00"
              title="ใส่เวลารูปแบบ HH:MM เช่น 14:00, 18:00, 22:00"
            />
          </div>
          <div className="form-row">
            <label>วันที่ใช้</label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
              {DOW_LABEL.map((d, i) => (
                <label key={i} className="flex" style={{ fontSize: 13 }}>
                  <input type="checkbox" name="days" value={i} defaultChecked style={{ width: 16, height: 16 }} aria-label={`วัน${DOW_FULL[i]}`} />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-2">
            <div className="form-row">
              <label>สถานที่ (ไม่บังคับ)</label>
              <input name="location" />
            </div>
            <div className="form-row">
              <label>คะแนนเข้าร่วม</label>
              <input name="points_reward" type="number" defaultValue={10} />
            </div>
          </div>
          <div className="form-row">
            <label>หมายเหตุ (ไม่บังคับ)</label>
            <textarea name="notes" rows={2} placeholder="เช่น 'รวมก่อน 5 นาที'" />
          </div>
          <SubmitButton className="btn btn-primary btn-block" pendingText="กำลังเพิ่ม…">เพิ่มเทมเพลต</SubmitButton>
        </form>
      </div>

      <div className="section-h"><h2>เทมเพลตทั้งหมด ({templates?.length ?? 0})</h2></div>
      {(templates ?? []).length === 0 ? (
        <div className="empty">ยังไม่มีเทมเพลต — เพิ่มข้างบน</div>
      ) : (
        <div className="stack">
          {(templates ?? []).map((t) => (
            <div key={t.id} className="card" style={{ padding: 18 }}>
              <div className="spread">
                <div>
                  <span className="pill pill-gold">{eventLabels[t.type as EventType] ?? t.type}</span>
                  <h3 style={{ marginTop: 8 }}>{t.title}</h3>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#bbb" }}>
                    เวลา: <span className="gold">{(t.times_of_day ?? []).join(", ")}</span> ·
                    วัน: {(t.days_of_week ?? []).map((d: number) => DOW_LABEL[d]).join(", ")} ·
                    คะแนน: <span className="gold">+{t.points_reward}</span>
                  </div>
                  {t.location && <small className="muted">📍 {t.location}</small>}
                  {t.last_spawned_at && (
                    <div><small className="muted">spawn ล่าสุด: {new Date(t.last_spawned_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</small></div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={toggleTemplate}>
                    <input type="hidden" name="template_id" value={t.id} />
                    <input type="hidden" name="active" value={String(t.active)} />
                    <button type="submit" className={`btn btn-sm ${t.active ? "btn-success" : ""}`}>
                      {t.active ? "Active" : "Paused"}
                    </button>
                  </form>
                  <form action={deleteTemplate}>
                    <input type="hidden" name="template_id" value={t.id} />
                    <ConfirmSubmit message="ลบเทมเพลตนี้ทั้งหมด? (ไม่กระทบ event ที่สร้างไปแล้ว)" className="btn btn-sm btn-danger">ลบ</ConfirmSubmit>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
