import { adminClient } from "@/lib/supabase";

export default async function AdminOverview() {
  const sb = adminClient();
  const [{ count: pendingApps }, { count: pendingLOA }, { count: openEvents }, { count: members }] = await Promise.all([
    sb.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("leaves").select("id", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("events").select("id", { count: "exact", head: true }).eq("status", "open").gte("when_at", new Date().toISOString()),
    sb.from("members").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);
  const { data: pendingApplications } = await sb
    .from("applications")
    .select("id, display_name, reason, available_time, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Admin Console</p>
        <h1>ภาพรวมระบบ</h1>
      </div>
      <div className="grid grid-4">
        <a className="card" href="/admin/applicants">
          <small>ใบสมัครรอรับ</small>
          <h2 className={`${(pendingApps ?? 0) > 0 ? "warn" : ""}`} style={{ marginTop: 6 }}>{pendingApps ?? 0}</h2>
        </a>
        <a className="card" href="/admin/members">
          <small>คำขอลารอดู</small>
          <h2 className={`${(pendingLOA ?? 0) > 0 ? "warn" : ""}`} style={{ marginTop: 6 }}>{pendingLOA ?? 0}</h2>
        </a>
        <a className="card" href="/events">
          <small>กิจกรรมเปิดอยู่</small>
          <h2 style={{ marginTop: 6 }}>{openEvents ?? 0}</h2>
        </a>
        <a className="card" href="/roster">
          <small>สมาชิก Active</small>
          <h2 style={{ marginTop: 6 }}>{members ?? 0}</h2>
        </a>
      </div>

      <div className="section-h" style={{ marginTop: 24 }}><h2>ใบสมัครล่าสุด</h2><a href="/admin/applicants" className="muted" style={{ fontSize: 12 }}>ดูทั้งหมด →</a></div>
      {pendingApplications && pendingApplications.length > 0 ? (
        <div className="stack">
          {pendingApplications.map((a) => (
            <div key={a.id} className="card spread">
              <div>
                <strong>{a.display_name}</strong>
                <small className="muted" style={{ display: "block", marginTop: 4 }}>{a.available_time || "—"}</small>
                <p style={{ fontSize: 13, marginTop: 6 }}>{a.reason}</p>
              </div>
              <a href="/admin/applicants" className="btn btn-sm">พิจารณา</a>
            </div>
          ))}
        </div>
      ) : <div className="empty">ไม่มีใบสมัครค้าง</div>}
    </div>
  );
}
