import { adminClient } from "@/lib/supabase";
import Avatar from "@/components/Avatar";
import { rankLabels, type Rank } from "@/lib/types";
import Link from "next/link";
import { memberArt } from "@/lib/member-assets";

export default async function Ranking() {
  const sb = adminClient();
  const { data: rows } = await sb
    .from("v_monthly_ranking")
    .select("member_id, name, rank, avatar_url, points_month, points_total")
    .order("points_month", { ascending: false });

  const list = rows ?? [];
  const top = list.slice(0, 3);
  // podium order: 2nd | 1st | 3rd
  const podium = [top[1], top[0], top[2]].filter(Boolean);

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Monthly Billboard</p>
        <h1>อันดับประจำเดือน</h1>
        <p>คำนวณจากการเข้าร่วมกิจกรรม + การขาด/ลา</p>
      </div>

      {podium.length > 0 && (
        <div className="ranking-stage">
          <img className="ranking-bg" src="/assets/ranking-billboard.png" alt="" />
          <div className="podium">
          {podium.map((m, i) => {
            const realRank = list.findIndex((r) => r.member_id === m.member_id) + 1;
            const cls = realRank === 1 ? "first" : realRank === 2 ? "second" : "third";
            const art = memberArt(m.name, m.avatar_url);
            return (
              <div key={m.member_id} className={`podium-card ${cls}`}>
                <div className="podium-rank">#{realRank}</div>
                {art && <img className="podium-art" src={art} alt="" />}
                <div className="podium-info">
                  <h3>{m.name}</h3>
                  <p className="gold" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{m.points_month} pts</p>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {list.length > 0 ? (
        <div className="card" style={{ padding: 0, marginTop: 12, overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr><th>อันดับ</th><th>สมาชิก</th><th>ยศ</th><th>เดือนนี้</th><th>รวม</th></tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.member_id}>
                  <td><strong className={i < 3 ? "gold" : ""}>#{i + 1}</strong></td>
                  <td>
                    <Link href={`/roster/${r.member_id}`} className="name-cell">
                      <Avatar src={r.avatar_url} name={r.name} size="sm" />
                      <span>{r.name}</span>
                    </Link>
                  </td>
                  <td><span className="pill">{rankLabels[r.rank as Rank] ?? r.rank}</span></td>
                  <td className="gold"><strong>{r.points_month}</strong></td>
                  <td className="muted">{r.points_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">ยังไม่มีข้อมูล ranking</div>
      )}
    </div>
  );
}
