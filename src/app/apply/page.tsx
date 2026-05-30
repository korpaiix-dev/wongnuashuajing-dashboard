import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { submitApplication } from "@/server-actions/applications";
import { adminClient } from "@/lib/supabase";

export default async function ApplyPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.persona === "member" || session.persona === "admin" || session.persona === "boss") {
    redirect("/dashboard");
  }

  // Check existing application status
  let existing: { status: string; display_name: string; created_at: string } | null = null;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = adminClient();
      const { data: profile } = await sb.from("profiles").select("id").eq("discord_user_id", session.discordId).maybeSingle();
      if (profile) {
        const { data } = await sb.from("applications").select("status, display_name, created_at").eq("profile_id", profile.id).maybeSingle();
        existing = data;
      }
    } catch {}
  }

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: 24 }}>
      <div className="card" style={{ padding: 32 }}>
        <p className="eyebrow">Gang Application</p>
        <h1 style={{ marginTop: 6, marginBottom: 6 }}>สมัครเข้าแก๊ง</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          ยืนยันตัวด้วย Discord เรียบร้อย — กรอกข้อมูลส่งให้ Boss / Admin พิจารณา
        </p>

        {existing ? (
          <div className="card" style={{ background: "#0e0e0e", borderColor: "var(--gold-soft)" }}>
            <div className="spread">
              <div>
                <strong>{existing.display_name}</strong>
                <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                  ส่ง: {new Date(existing.created_at).toLocaleString("th-TH")}
                </p>
              </div>
              <span className={`pill pill-${existing.status === "pending" ? "warn" : existing.status === "approved" ? "success" : "danger"}`}>
                {existing.status === "pending" && "รออนุมัติ"}
                {existing.status === "approved" && "ผ่านแล้ว"}
                {existing.status === "rejected" && "ไม่ผ่าน"}
              </span>
            </div>
            {existing.status === "pending" && (
              <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 13 }}>
                Admin จะแจ้งผลใน Discord เมื่อมีการพิจารณา
              </p>
            )}
          </div>
        ) : (
          <form action={submitApplication} className="form">
            <div className="form-row">
              <label>ชื่อในเมือง / In-game name</label>
              <input name="display_name" required maxLength={40} placeholder="เช่น Aheye" />
            </div>
            <div className="form-row">
              <label>เวลาที่เล่นได้</label>
              <input name="available_time" placeholder="เช่น 20:00 - 01:00 ทุกวัน" />
            </div>
            <div className="form-row">
              <label>เหตุผลที่อยากเข้าแก๊ง</label>
              <textarea name="reason" rows={4} required maxLength={500} placeholder="ทำไมอยากเข้าแก๊งนี้?" />
            </div>
            <button type="submit" className="btn btn-primary btn-block">ส่งใบสมัคร</button>
          </form>
        )}
      </div>
    </div>
  );
}
