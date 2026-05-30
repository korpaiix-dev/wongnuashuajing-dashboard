import { auth } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import { adminClient } from "@/lib/supabase";
import { reviewLeaveForm } from "@/server-actions/leaves";
import { kickMemberForm, updateMemberRankForm } from "@/server-actions/members";
import { rankLabels, type Rank } from "@/lib/types";
import ConfirmSubmit from "@/components/ConfirmSubmit";

export default async function MembersAdmin() {
  const session = await auth();
  const sb = adminClient();
  const { data: members } = await sb
    .from("members")
    .select("id, name, rank, status, joined_at, profiles(discord_username, avatar_url)")
    .order("rank")
    .order("name");
  const { data: pendingLeaves } = await sb
    .from("leaves")
    .select("id, type, start_date, end_date, reason, status, created_at, members!leaves_member_id_fkey(id, name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const canChangeRank = session?.persona === "boss";

  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Admin</p>
        <h1>จัดการสมาชิก</h1>
      </div>

      <div className="section-h"><h2>คำขอลาที่รอ ({pendingLeaves?.length ?? 0})</h2></div>
      {pendingLeaves && pendingLeaves.length > 0 ? (
        <div className="stack" style={{ marginBottom: 24 }}>
          {pendingLeaves.map((l) => (
            <div key={l.id} className="card spread">
              <div>
                <strong>{(l as unknown as { members?: { name?: string } | null }).members?.name}</strong>
                <small className="muted" style={{ display: "block", marginTop: 4 }}>
                  {l.type === "loa" ? "ลา" : "ขาด"} · {l.start_date}{l.end_date !== l.start_date ? ` → ${l.end_date}` : ""}
                </small>
                {l.reason && <p style={{ fontSize: 13, marginTop: 6 }}>{l.reason}</p>}
              </div>
              <form action={reviewLeaveForm} style={{ display: "flex", gap: 8 }}>
                <input type="hidden" name="leave_id" value={l.id} />
                <button type="submit" name="verdict" value="approve" className="btn btn-success btn-sm">✓ อนุมัติ</button>
                <button type="submit" name="verdict" value="reject" className="btn btn-danger btn-sm">✕ ไม่ผ่าน</button>
              </form>
            </div>
          ))}
        </div>
      ) : <div className="empty" style={{ marginBottom: 24 }}>ไม่มีคำขอลาที่รอ</div>}

      <div className="section-h"><h2>สมาชิกทั้งหมด ({members?.length ?? 0})</h2></div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>สมาชิก</th><th>Discord</th><th>ยศ</th><th>สถานะ</th><th style={{ width: 280 }}>จัดการ</th></tr></thead>
          <tbody>
            {(members ?? []).map((m) => {
              const p = (m as unknown as { profiles?: { discord_username?: string; avatar_url?: string | null } | null }).profiles;
              return (
                <tr key={m.id}>
                  <td>
                    <span className="name-cell">
                      <Avatar src={p?.avatar_url} name={m.name} size="sm" />
                      <span>{m.name}</span>
                    </span>
                  </td>
                  <td className="muted">@{p?.discord_username ?? "—"}</td>
                  <td><span className={`pill pill-${m.rank === "boss" ? "gold" : m.rank === "admin" ? "warn" : ""}`}>{rankLabels[m.rank as Rank]}</span></td>
                  <td><span className={`pill pill-${m.status === "active" ? "success" : m.status === "loa" ? "warn" : "danger"}`}>{m.status}</span></td>
                  <td>
                    {canChangeRank && m.status === "active" && (
                      <form action={updateMemberRankForm} style={{ display: "inline-flex", gap: 6, marginRight: 6 }}>
                        <input type="hidden" name="member_id" value={m.id} />
                        <select name="rank" defaultValue={m.rank} style={{ width: 100 }}>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="boss">Boss</option>
                        </select>
                        <button type="submit" className="btn btn-sm">บันทึก</button>
                      </form>
                    )}
                    {canChangeRank && m.status !== "kicked" && (
                      <form action={kickMemberForm} style={{ display: "inline-block" }}>
                        <input type="hidden" name="member_id" value={m.id} />
                        <ConfirmSubmit message="ปลดสมาชิกคนนี้ออกจากแก๊ง?" className="btn btn-sm btn-danger">ปลด</ConfirmSubmit>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!canChangeRank && <small className="muted" style={{ display: "block", marginTop: 12 }}>การเปลี่ยนยศ/ปลด เฉพาะ Boss เท่านั้น</small>}
    </div>
  );
}
