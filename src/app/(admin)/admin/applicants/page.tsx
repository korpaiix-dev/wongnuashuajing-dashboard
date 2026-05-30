import { adminClient } from "@/lib/supabase";
import { reviewApplication } from "@/server-actions/applications";

export default async function ApplicantsAdmin() {
  const sb = adminClient();
  const { data: apps } = await sb
    .from("applications")
    .select("id, display_name, reason, available_time, created_at, profiles!applications_profile_id_fkey(discord_username, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Admin</p>
        <h1>ผู้สมัครรอรับ</h1>
        <p>กดรับและกำหนดยศ → สมาชิกใหม่จะเห็นเว็บได้ทันที</p>
      </div>

      {apps && apps.length > 0 ? (
        <div className="stack">
          {apps.map((a) => {
            const p = (a as unknown as { profiles?: { discord_username?: string; avatar_url?: string | null } | null }).profiles;
            return (
              <div key={a.id} className="card" style={{ padding: 20 }}>
                <div className="flex" style={{ marginBottom: 12 }}>
                  {p?.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="avatar avatar-lg" />
                  ) : (
                    <div className="avatar avatar-lg">{a.display_name.charAt(0).toUpperCase()}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 16 }}>{a.display_name}</strong>
                    <div><small className="muted">@{p?.discord_username ?? "—"} · เล่นได้ {a.available_time || "—"}</small></div>
                  </div>
                  <small className="muted">{new Date(a.created_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}</small>
                </div>
                <p style={{ fontSize: 13, marginBottom: 14 }}>{a.reason}</p>
                <form action={reviewApplication} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="application_id" value={a.id} />
                  <select name="rank" defaultValue="member" style={{ maxWidth: 140 }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="boss">Boss</option>
                  </select>
                  <button type="submit" name="verdict" value="approve" className="btn btn-primary">รับเข้าแก๊ง</button>
                  <button type="submit" name="verdict" value="reject" className="btn btn-danger">ปฏิเสธ</button>
                </form>
              </div>
            );
          })}
        </div>
      ) : <div className="empty">ไม่มีใบสมัครค้าง</div>}
    </div>
  );
}
