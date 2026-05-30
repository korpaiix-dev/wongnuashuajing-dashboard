import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { rsvpForm } from "@/server-actions/events";
import Avatar from "@/components/Avatar";
import { memberArt } from "@/lib/member-assets";

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const sb = adminClient();

  const { data: ev } = await sb.from("events").select("*").eq("id", id).maybeSingle();
  if (!ev) notFound();
  const { data: result } = await sb.from("event_results").select("*").eq("event_id", id).maybeSingle();
  const { data: rsvps } = await sb
    .from("event_rsvp")
    .select("response, members(id, name, profiles(avatar_url))")
    .eq("event_id", id);
  const { data: myRsvp } = session?.memberId
    ? await sb.from("event_rsvp").select("response").eq("event_id", id).eq("member_id", session.memberId).maybeSingle()
    : { data: null };

  type R = { response: "yes" | "no" | "pending"; members?: { id: string; name: string; profiles?: { avatar_url?: string | null } | null } | null };
  const yesList = ((rsvps ?? []) as unknown as R[]).filter((r) => r.response === "yes");
  const noList = ((rsvps ?? []) as unknown as R[]).filter((r) => r.response === "no");

  return (
    <div>
      <div style={{ marginBottom: 24 }}><a href="/events" className="muted" style={{ fontSize: 12 }}>← กลับ Events</a></div>
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <span className="pill pill-gold">{ev.type.toUpperCase()}</span>
        <h1 style={{ marginTop: 10 }}>{ev.title}</h1>
        <p style={{ marginTop: 8 }}>{new Date(ev.when_at).toLocaleString("th-TH", { dateStyle: "full", timeStyle: "short" })}</p>
        {ev.location && <p>📍 {ev.location}</p>}
        {ev.enemy_gang && <p>⚔ vs {ev.enemy_gang}</p>}
        {ev.notes && <p style={{ marginTop: 10, color: "#bbb" }}>{ev.notes}</p>}
        <p style={{ marginTop: 10 }}><span className="pill pill-gold">+{ev.points_reward} pts</span></p>

        {ev.status === "open" && session?.memberId && (
          <form action={rsvpForm} style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <input type="hidden" name="event_id" value={id} />
            <button type="submit" name="response" value="yes" className={`btn ${myRsvp?.response === "yes" ? "btn-success" : ""}`}>✅ เข้าร่วม</button>
            <button type="submit" name="response" value="no" className={`btn ${myRsvp?.response === "no" ? "btn-danger" : ""}`}>❌ ไม่เข้าร่วม</button>
          </form>
        )}
      </div>

      {result?.outcome && (
        <div className="card" style={{ borderColor: result.outcome === "win" ? "var(--success)" : "var(--line)" }}>
          <p className="eyebrow">Result</p>
          <h2 style={{ marginTop: 6 }}>{result.outcome === "win" ? "ชนะ" : result.outcome === "loss" ? "แพ้" : "เสมอ"}{result.our_score != null ? ` — ${result.our_score} : ${result.their_score ?? "?"}` : ""}</h2>
          {result.notes && <p style={{ marginTop: 8 }}>{result.notes}</p>}
        </div>
      )}

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3 className="success">เข้าร่วม ({yesList.length})</h3>
          <div className="stack" style={{ marginTop: 12 }}>
            {yesList.length === 0 && <small className="muted">ยังไม่มีใครตอบรับ</small>}
            {yesList.map((r, i) => r.members && (
              <div key={i} className="flex">
                <Avatar src={memberArt(r.members.name, r.members.profiles?.avatar_url)} name={r.members.name} size="sm" />
                <span>{r.members.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="danger">ไม่เข้าร่วม ({noList.length})</h3>
          <div className="stack" style={{ marginTop: 12 }}>
            {noList.length === 0 && <small className="muted">—</small>}
            {noList.map((r, i) => r.members && (
              <div key={i} className="flex">
                <Avatar src={memberArt(r.members.name, r.members.profiles?.avatar_url)} name={r.members.name} size="sm" />
                <span>{r.members.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
