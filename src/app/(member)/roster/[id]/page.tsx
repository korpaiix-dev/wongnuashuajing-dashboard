import { adminClient } from "@/lib/supabase";
import Avatar from "@/components/Avatar";
import { rankLabels, type Rank } from "@/lib/types";
import { notFound } from "next/navigation";
import { memberArt } from "@/lib/member-assets";

export default async function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = adminClient();
  const { data: m } = await sb
    .from("members")
    .select("id, name, rank, status, joined_at, profile_id, profiles(avatar_url, bio, discord_username)")
    .eq("id", id)
    .maybeSingle();
  if (!m) notFound();

  const { data: pts } = await sb.from("v_monthly_ranking").select("points_month, points_total").eq("member_id", id).maybeSingle();
  const { data: rsvps } = await sb
    .from("event_rsvp")
    .select("response, events(id, title, type, when_at, status)")
    .eq("member_id", id)
    .order("responded_at", { ascending: false })
    .limit(10);

  const profile = (m as unknown as { profiles?: { avatar_url?: string | null; bio?: string | null; discord_username?: string | null } | null }).profiles;
  const rank = m.rank as Rank;

  return (
    <div>
      <div style={{ marginBottom: 24 }}><a href="/roster" className="muted" style={{ fontSize: 12 }}>← กลับไป Roster</a></div>
      <div className="profile-hero card">
        <div className="profile-hero-bg" aria-hidden="true" />
        <Avatar src={memberArt(m.name, profile?.avatar_url)} name={m.name} size="xl" />
        <div style={{ flex: 1 }}>
          <span className={`pill pill-${rank === "boss" ? "gold" : rank === "admin" ? "warn" : ""}`}>{rankLabels[rank]}</span>
          <h1 style={{ marginTop: 8 }}>{m.name}</h1>
          <small>@{profile?.discord_username ?? "—"} · เข้าแก๊ง {new Date(m.joined_at).toLocaleDateString("th-TH")}</small>
          {profile?.bio && <p style={{ marginTop: 10, fontStyle: "italic", color: "#bbb" }}>"{profile.bio}"</p>}
        </div>
        <div style={{ textAlign: "center" }}>
          <small>คะแนนเดือนนี้</small>
          <h1 className="gold" style={{ fontSize: 36 }}>{pts?.points_month ?? 0}</h1>
          <small className="muted">รวม {pts?.points_total ?? 0}</small>
        </div>
      </div>

      <div className="section-h"><h2>กิจกรรมล่าสุด</h2></div>
      {rsvps && rsvps.length > 0 ? (
        <div className="stack">
          {rsvps.map((r, i) => {
            const ev = (r as unknown as { events?: { id: string; title: string; type: string; when_at: string; status: string } | null }).events;
            if (!ev) return null;
            return (
              <a key={i} href={`/events/${ev.id}`} className="card spread" style={{ display: "flex" }}>
                <div>
                  <span className="pill pill-gold">{ev.type.toUpperCase()}</span>
                  <h3 style={{ marginTop: 8 }}>{ev.title}</h3>
                  <small>{new Date(ev.when_at).toLocaleString("th-TH")}</small>
                </div>
                <span className={`pill pill-${r.response === "yes" ? "success" : r.response === "no" ? "danger" : "warn"}`}>
                  {r.response === "yes" ? "เข้าร่วม" : r.response === "no" ? "ไม่เข้าร่วม" : "รอตอบ"}
                </span>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="empty">ยังไม่มีกิจกรรมล่าสุด</div>
      )}
    </div>
  );
}
