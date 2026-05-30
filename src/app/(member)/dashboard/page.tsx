import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";

export default async function MemberDashboard() {
  const session = await auth();
  const sb = adminClient();

  // Upcoming events (next 5)
  const { data: upcoming } = await sb
    .from("events")
    .select("id, type, title, when_at, location, points_reward")
    .eq("status", "open")
    .gte("when_at", new Date().toISOString())
    .order("when_at", { ascending: true })
    .limit(5);

  // My points (month)
  let myPoints = 0;
  let myRank: number | null = null;
  if (session?.memberId) {
    const { data: rows } = await sb
      .from("v_monthly_ranking")
      .select("member_id, points_month");
    if (rows) {
      const sorted = [...rows].sort((a, b) => (b.points_month ?? 0) - (a.points_month ?? 0));
      const idx = sorted.findIndex((r) => r.member_id === session.memberId);
      if (idx >= 0) {
        myRank = idx + 1;
        myPoints = sorted[idx].points_month ?? 0;
      }
    }
  }

  // Member counts
  const { count: memberCount } = await sb.from("members").select("id", { count: "exact", head: true }).eq("status", "active");
  const { count: pendingApps } = await sb.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending");

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Dashboard</p>
        <h1>สวัสดี {session?.displayName}</h1>
        <p>ภาพรวมของคุณและกิจกรรมที่กำลังจะมา</p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <small>คะแนนเดือนนี้</small>
          <h2 className="gold" style={{ marginTop: 6 }}>{myPoints}</h2>
        </div>
        <div className="card">
          <small>อันดับของฉัน</small>
          <h2 style={{ marginTop: 6 }}>{myRank ? `#${myRank}` : "—"}</h2>
        </div>
        <div className="card">
          <small>สมาชิก Active</small>
          <h2 style={{ marginTop: 6 }}>{memberCount ?? 0}</h2>
        </div>
      </div>

      <div className="section-h">
        <h2>กิจกรรมที่กำลังจะมา</h2>
        <a href="/events" className="muted" style={{ fontSize: 12 }}>ดูทั้งหมด →</a>
      </div>
      {upcoming && upcoming.length > 0 ? (
        <div className="stack">
          {upcoming.map((e) => (
            <a key={e.id} href={`/events/${e.id}`} className="card spread" style={{ display: "flex" }}>
              <div>
                <span className="pill pill-gold">{e.type.toUpperCase()}</span>
                <h3 style={{ marginTop: 8 }}>{e.title}</h3>
                <small>{new Date(e.when_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}{e.location ? ` · ${e.location}` : ""}</small>
              </div>
              <span className="pill" style={{ color: "var(--gold)" }}>+{e.points_reward}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty">ยังไม่มีกิจกรรมที่กำหนดไว้</div>
      )}

      {(session?.persona === "admin" || session?.persona === "boss") && (pendingApps ?? 0) > 0 && (
        <div className="card" style={{ marginTop: 24, borderColor: "var(--warn)" }}>
          <div className="spread">
            <div>
              <strong className="warn">ใบสมัครรอรับ {pendingApps} ฉบับ</strong>
              <p style={{ fontSize: 12, marginTop: 4 }}>กดเข้าหน้า Applicants เพื่อพิจารณา</p>
            </div>
            <a href="/admin/applicants" className="btn btn-sm">ดูใบสมัคร</a>
          </div>
        </div>
      )}
    </div>
  );
}
