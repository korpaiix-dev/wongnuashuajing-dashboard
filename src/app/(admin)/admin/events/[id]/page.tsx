import { adminClient } from "@/lib/supabase";
import { submitEventResultForm } from "@/server-actions/events";
import { notFound } from "next/navigation";

export default async function AdminEventResult({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = adminClient();
  const { data: ev } = await sb.from("events").select("*").eq("id", id).maybeSingle();
  if (!ev) notFound();
  const { data: rsvps } = await sb
    .from("event_rsvp")
    .select("response, members(id, name)")
    .eq("event_id", id);
  const { data: result } = await sb.from("event_results").select("*").eq("event_id", id).maybeSingle();
  const { data: allMembers } = await sb.from("members").select("id, name").eq("status", "active").order("name");

  type R = { response: "yes" | "no" | "pending"; members?: { id: string; name: string } | null };
  const yesIds = new Set(((rsvps ?? []) as unknown as R[]).filter((r) => r.response === "yes").map((r) => r.members?.id).filter(Boolean) as string[]);

  return (
    <div>
      <div style={{ marginBottom: 18 }}><a href="/admin" className="muted" style={{ fontSize: 12 }}>← กลับ Admin</a></div>
      <div className="page-head">
        <p className="eyebrow">{ev.type.toUpperCase()}</p>
        <h1>{ev.title}</h1>
        <p className="muted">{new Date(ev.when_at).toLocaleString("th-TH")}</p>
      </div>

      <form action={submitEventResultForm} className="card form" style={{ padding: 24 }}>
        <input type="hidden" name="event_id" value={id} />
        <h2>กรอกผล</h2>
        <div className="grid grid-3">
          <div className="form-row">
            <label>ผล</label>
            <select name="outcome" defaultValue={result?.outcome ?? ""}>
              <option value="">—</option>
              <option value="win">ชนะ</option>
              <option value="loss">แพ้</option>
              <option value="draw">เสมอ</option>
            </select>
          </div>
          <div className="form-row">
            <label>สกอร์ของเรา</label>
            <input name="our_score" type="number" defaultValue={result?.our_score ?? ""} />
          </div>
          <div className="form-row">
            <label>สกอร์ฝั่งตรงข้าม</label>
            <input name="their_score" type="number" defaultValue={result?.their_score ?? ""} />
          </div>
        </div>
        <div className="form-row">
          <label>MVP (ได้ +30)</label>
          <select name="mvp_member_id" defaultValue={result?.mvp_member_id ?? ""}>
            <option value="">— ไม่มี —</option>
            {(allMembers ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>สมาชิกที่มาจริง (tick) — default คือคนกด &quot;เข้าร่วม&quot;</label>
          <div className="grid grid-3" style={{ marginTop: 6, padding: 12, background: "#080808", borderRadius: 8 }}>
            {(allMembers ?? []).map((m) => (
              <label key={m.id} className="flex" style={{ fontSize: 13 }}>
                <input type="checkbox" name="attended" value={m.id} defaultChecked={yesIds.has(m.id)} style={{ width: 16, height: 16 }} />
                <span>{m.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-row">
          <label>หมายเหตุ</label>
          <textarea name="notes" rows={2} defaultValue={result?.notes ?? ""} />
        </div>
        <button type="submit" className="btn btn-primary btn-block">บันทึกผล + ให้คะแนน</button>
      </form>
    </div>
  );
}
