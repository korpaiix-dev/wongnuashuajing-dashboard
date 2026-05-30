import { adminClient } from "@/lib/supabase";
import { updateScoreSettings } from "@/server-actions/settings";
import SubmitButton from "@/components/SubmitButton";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type Row = { label: string; key: string; help: string; positive: boolean };

const POSITIVE_ROWS: Row[] = [
  { label: "Airdrop เข้าร่วม", key: "airdrop_join",    help: "+ ต่อคนที่เข้าร่วม", positive: true },
  { label: "Story เข้าร่วม",    key: "story_join",      help: "+ ต่อคนที่เข้าร่วม", positive: true },
  { label: "Story ชนะ (bonus)", key: "story_win_bonus", help: "เพิ่มจาก story_join เมื่อชนะ", positive: true },
  { label: "Meeting เข้าร่วม", key: "meeting_join",    help: "+ ต่อคนที่เข้าร่วม", positive: true },
  { label: "Training เข้าร่วม", key: "training_join",   help: "+ ต่อคนที่เข้าร่วม", positive: true },
  { label: "MVP",               key: "mvp_bonus",       help: "+ ให้ MVP ของ event", positive: true },
];

const NEGATIVE_ROWS: Row[] = [
  { label: "ขาด (ไม่แจ้ง)",     key: "absent_no_notice", help: "หักเมื่อสมาชิกกดแจ้งขาด",       positive: false },
  { label: "ลา (แจ้งล่วงหน้า)",  key: "loa_taken",        help: "หักเมื่อ admin อนุมัติคำขอลา",   positive: false },
  { label: "ลาเกิน/วัน",        key: "overstay_per_day", help: "หักทุกวันที่ลาเกินที่แจ้ง",      positive: false },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session || session.persona !== "boss") redirect("/admin");

  const sb = adminClient();
  const { data } = await sb.from("app_settings").select("key, value").like("key", "score_%");
  const valueOf = (k: string) => data?.find((r) => r.key === `score_${k}`)?.value ?? "";
  const overstayMax = valueOf("overstay_max_days") || "7";

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Settings</p>
        <h1>ตั้งค่าคะแนน</h1>
        <p>ปรับค่าได้ทันที — ใช้กับ event/leave ถัดไป (cache 60 วินาที)</p>
      </div>

      <form action={updateScoreSettings} className="form" style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: 22, marginBottom: 16 }}>
          <h3 className="success">+ ฝั่งได้คะแนน</h3>
          <div className="grid grid-2" style={{ marginTop: 12, gap: 14 }}>
            {POSITIVE_ROWS.map((r) => (
              <div key={r.key} className="form-row">
                <label>{r.label} <small className="muted">— {r.help}</small></label>
                <input name={r.key} type="number" defaultValue={valueOf(r.key)} required />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 16 }}>
          <h3 className="danger">− ฝั่งเสียคะแนน</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            <strong className="muted">ใส่ตัวเลขลบ</strong> (เช่น <code>-15</code>)
          </p>
          <div className="grid grid-2" style={{ marginTop: 12, gap: 14 }}>
            {NEGATIVE_ROWS.map((r) => (
              <div key={r.key} className="form-row">
                <label>{r.label} <small className="muted">— {r.help}</small></label>
                <input name={r.key} type="number" defaultValue={valueOf(r.key)} required />
              </div>
            ))}
            <div className="form-row">
              <label>ลาเกินสูงสุดกี่วัน <small className="muted">— เกินจากนี้หยุดหักอัตโนมัติ</small></label>
              <input name="overstay_max_days" type="number" min={1} max={30} defaultValue={overstayMax} required />
            </div>
          </div>
        </div>

        <SubmitButton className="btn btn-primary btn-block" pendingText="กำลังบันทึก…">บันทึกการตั้งค่า</SubmitButton>
      </form>
    </div>
  );
}
