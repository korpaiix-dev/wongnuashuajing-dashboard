import { adminClient } from "@/lib/supabase";
import { rankLabels, type Rank } from "@/lib/types";
import Link from "next/link";

const RANK_ORDER: Rank[] = ["boss", "admin", "member"];

export default async function Roster() {
  const sb = adminClient();
  const { data: members } = await sb
    .from("members")
    .select("id, name, rank, status, profile_id, profiles(avatar_url)")
    .neq("status", "kicked")
    .order("name");

  type Row = { id: string; name: string; rank: Rank; status: string; profiles?: { avatar_url?: string | null } | null };
  const grouped: Record<Rank, Row[]> = { boss: [], admin: [], member: [] };
  (members ?? []).forEach((m) => {
    const row = m as unknown as Row;
    grouped[row.rank]?.push(row);
  });

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Official Roster</p>
        <h1>สมาชิกแก๊ง</h1>
        <p>{members?.length ?? 0} สมาชิก active</p>
      </div>

      {RANK_ORDER.map((rank) =>
        grouped[rank].length > 0 ? (
          <div key={rank} style={{ marginBottom: 28 }}>
            <div className="section-h">
              <h2>{rankLabels[rank]} <small className="muted" style={{ marginLeft: 8 }}>({grouped[rank].length})</small></h2>
            </div>
            <div className="grid grid-4">
              {grouped[rank].map((m) => (
                <Link key={m.id} href={`/roster/${m.id}`} className="card" style={{ textAlign: "center" }}>
                  {m.profiles?.avatar_url ? (
                    <img src={m.profiles.avatar_url} alt="" className="avatar avatar-lg" style={{ margin: "0 auto 10px" }} />
                  ) : (
                    <div className="avatar avatar-lg" style={{ margin: "0 auto 10px" }}>{m.name.charAt(0).toUpperCase()}</div>
                  )}
                  <strong>{m.name}</strong>
                  <div style={{ marginTop: 6 }}>
                    <span className={`pill pill-${rank === "boss" ? "gold" : rank === "admin" ? "warn" : ""}`}>{rankLabels[rank]}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null
      )}
      {(!members || members.length === 0) && <div className="empty">ยังไม่มีสมาชิก — รอ admin approve ผู้สมัครก่อน</div>}
    </div>
  );
}
