import { adminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function EventsList() {
  const sb = adminClient();
  const now = new Date().toISOString();
  const { data: open } = await sb
    .from("events")
    .select("id, type, title, when_at, location, enemy_gang, points_reward")
    .eq("status", "open")
    .gte("when_at", now)
    .order("when_at");
  const { data: done } = await sb
    .from("events")
    .select("id, type, title, when_at, event_results(outcome, our_score, their_score)")
    .eq("status", "done")
    .order("when_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Events / Stories</p>
        <h1>กิจกรรมและสตอรี่</h1>
      </div>

      <div className="section-h"><h2>กำลังจะมา</h2></div>
      {open && open.length > 0 ? (
        <div className="stack">
          {open.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="card spread" style={{ display: "flex" }}>
              <div>
                <span className="pill pill-gold">{e.type.toUpperCase()}</span>
                <h3 style={{ marginTop: 8 }}>{e.title}</h3>
                <small>{new Date(e.when_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}{e.location ? ` · ${e.location}` : ""}{e.enemy_gang ? ` · vs ${e.enemy_gang}` : ""}</small>
              </div>
              <span className="pill" style={{ color: "var(--gold)" }}>+{e.points_reward}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">ยังไม่มีกิจกรรมที่กำหนดไว้</div>
      )}

      <div className="section-h" style={{ marginTop: 28 }}><h2>จบไปแล้ว</h2></div>
      {done && done.length > 0 ? (
        <div className="stack">
          {done.map((e) => {
            const res = (e as unknown as { event_results?: { outcome?: string | null; our_score?: number | null; their_score?: number | null }[] | { outcome?: string | null; our_score?: number | null; their_score?: number | null } | null }).event_results;
            const r = Array.isArray(res) ? res[0] : res;
            return (
              <Link key={e.id} href={`/events/${e.id}`} className="card spread" style={{ display: "flex" }}>
                <div>
                  <span className="pill">{e.type.toUpperCase()}</span>
                  <h3 style={{ marginTop: 8 }}>{e.title}</h3>
                  <small>{new Date(e.when_at).toLocaleString("th-TH")}</small>
                </div>
                {r?.outcome && (
                  <span className={`pill pill-${r.outcome === "win" ? "success" : r.outcome === "loss" ? "danger" : ""}`}>
                    {r.outcome === "win" ? "ชนะ" : r.outcome === "loss" ? "แพ้" : "เสมอ"}{r.our_score != null ? ` ${r.our_score}-${r.their_score ?? "?"}` : ""}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty">ยังไม่มีกิจกรรมที่จบไป</div>
      )}
    </div>
  );
}
