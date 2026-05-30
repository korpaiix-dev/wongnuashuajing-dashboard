"use client";
import { useStore, statusClass, formatPoints } from "@/lib/store";
import RoleGate from "./RoleGate";

export default function Ranking() {
  const members = useStore((s) => s.members);
  const rankingQuery = useStore((s) => s.rankingQuery);
  const setRankingQuery = useStore((s) => s.setRankingQuery);

  const sorted = [...members].sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
  const topThree = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
  const filtered = sorted.filter((m) => {
    const text = `${m.name} ${m.discord} ${m.role} ${m.status} ${m.activity}`.toLowerCase();
    return !rankingQuery || text.includes(rankingQuery.toLowerCase());
  });

  return (
    <section className="section ranking-section" id="ranking">
      <div className="ranking-shell">
        <div className="ranking-head">
          <div><p className="eyebrow">Monthly Billboard</p><h2>อันดับ 1 / 2 / 3 ประจำเดือน</h2></div>
          <input className="ranking-search" type="search" placeholder="ค้นหาชื่อ / Discord" value={rankingQuery} onChange={(e) => setRankingQuery(e.target.value)} />
        </div>
        <div className="podium">
          {topThree.map((m) => {
            const actualRank = sorted.findIndex((x) => x.id === m.id) + 1;
            const cls = actualRank === 1 ? "first" : actualRank === 2 ? "second" : "third";
            return (
              <article key={m.id} className={`podium-card ${cls}`}>
                <img src={m.image || "/assets/gang-emblem.png"} alt={m.name} />
                <span className="trophy-badge">{actualRank}</span>
                <h3>{m.name}</h3>
                <p>{formatPoints(m.points)} pts</p>
              </article>
            );
          })}
        </div>
        <section className="ranking-table-card">
          <div className="panel-head"><div><p className="eyebrow">Member List</p><h3>ตาราง Ranking</h3></div></div>
          <div className="table-wrap">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>ชื่อ</th><th>อันดับ</th><th>สถานะ</th><th>แต้ม</th><th>กิจกรรมล่าสุด</th>
                  <RoleGate minRole="secretary" as="th">จัดการ</RoleGate>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const rank = sorted.findIndex((x) => x.id === m.id) + 1;
                  return (
                    <tr key={m.id}>
                      <td>{m.image ? (
                        <span className="member-name"><img src={m.image} alt="" /> {m.name}</span>
                      ) : (
                        <><span className="avatar">{m.name.charAt(0).toUpperCase()}</span> {m.name}</>
                      )}</td>
                      <td>{rank <= 3 ? <span className={`rank-medal rank-${rank}`}>{rank}</span> : <span className="rank-plain">{rank}</span>}</td>
                      <td><span className={`status ${statusClass(m.status)}`}>{m.status}</span></td>
                      <td>{formatPoints(m.points)}</td>
                      <td>{m.activity}</td>
                      <RoleGate minRole="secretary" as="td"><button className="row-action" type="button">แก้ไข</button></RoleGate>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
