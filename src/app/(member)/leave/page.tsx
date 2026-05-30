import { auth } from "@/lib/auth";
import SubmitButton from "@/components/SubmitButton";
import { adminClient } from "@/lib/supabase";
import { submitLeave } from "@/server-actions/leaves";

export default async function LeavePage() {
  const session = await auth();
  if (!session?.memberId) return null;
  const sb = adminClient();
  const { data: mine } = await sb
    .from("leaves")
    .select("id, type, reason, start_date, end_date, status, created_at")
    .eq("member_id", session.memberId)
    .order("created_at", { ascending: false })
    .limit(20);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Attendance</p>
        <h1>แจ้งขาด / แจ้งลา</h1>
        <p>ขาด = ไม่ได้แจ้งล่วงหน้า (หัก {-1 * Math.abs(-15)} แต้ม) · ลา = แจ้งล่วงหน้า (หัก 2 แต้ม)</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>แจ้งใหม่</h3>
          <form action={submitLeave} className="form" style={{ marginTop: 12 }}>
            <div className="form-row">
              <label>ประเภท</label>
              <select name="type" defaultValue="loa">
                <option value="loa">ลา (แจ้งล่วงหน้า)</option>
                <option value="absent">ขาด (วันนี้)</option>
              </select>
            </div>
            <div className="form-row">
              <label>วันที่เริ่ม</label>
              <input name="start_date" type="date" defaultValue={today} required />
            </div>
            <div className="form-row">
              <label>วันที่สิ้นสุด</label>
              <input name="end_date" type="date" defaultValue={today} />
            </div>
            <div className="form-row">
              <label>เหตุผล</label>
              <textarea name="reason" rows={3} required minLength={5} placeholder="เหตุผลสั้นๆ (อย่างน้อย 5 ตัวอักษร)" />
            </div>
            <SubmitButton className="btn btn-primary btn-block" pendingText="กำลังส่ง…">ส่งคำขอ</SubmitButton>
          </form>
        </div>

        <div className="card">
          <h3>ประวัติของฉัน</h3>
          <div className="stack" style={{ marginTop: 12 }}>
            {mine && mine.length > 0 ? mine.map((l) => (
              <div key={l.id} className="card card-tight spread">
                <div>
                  <strong>{l.type === "loa" ? "ลา" : "ขาด"}</strong> <small className="muted">{l.start_date}{l.end_date && l.end_date !== l.start_date ? ` → ${l.end_date}` : ""}</small>
                  {l.reason && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l.reason}</p>}
                </div>
                <span className={`pill pill-${l.status === "approved" ? "success" : l.status === "rejected" ? "danger" : "warn"}`}>
                  {l.status === "pending" ? "รออนุมัติ" : l.status === "approved" ? "ผ่าน" : "ไม่ผ่าน"}
                </span>
              </div>
            )) : <small className="muted">ยังไม่เคยขาด/ลา</small>}
          </div>
        </div>
      </div>
    </div>
  );
}
