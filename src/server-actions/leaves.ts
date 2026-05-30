"use server";
import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { SCORE_RULES } from "@/lib/types";

export async function submitLeave(formData: FormData) {
  const session = await auth();
  if (!session?.memberId) return;
  const type = (formData.get("type") === "absent" ? "absent" : "loa") as "loa" | "absent";
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  const start_date = String(formData.get("start_date") ?? "");
  const end_date = String(formData.get("end_date") ?? start_date);
  if (!start_date) return;

  const sb = adminClient();
  await sb.from("leaves").insert({
    member_id: session.memberId,
    type, reason, start_date, end_date,
    status: type === "absent" ? "approved" : "pending", // ขาดทันที / ลาต้องอนุมัติ
  });

  // ขาดทันทีหักคะแนน — เลื่อนถ้าเป็นลา (admin approve ค่อยหักน้อย)
  if (type === "absent") {
    await sb.from("score_logs").insert({
      member_id: session.memberId,
      delta: SCORE_RULES.absent_no_notice,
      reason: `แจ้งขาด: ${reason || "ไม่ระบุ"}`,
    });
  }
  revalidatePath("/leave");
}

export async function reviewLeave(leaveId: string, approve: boolean) {
  const session = await auth();
  if (!session || (session.persona !== "admin" && session.persona !== "boss")) return;
  const sb = adminClient();
  const { data: lv } = await sb.from("leaves").select("*").eq("id", leaveId).maybeSingle();
  if (!lv || lv.status !== "pending") return;

  await sb.from("leaves").update({
    status: approve ? "approved" : "rejected",
    reviewed_by: session.memberId ?? null,
    reviewed_at: new Date().toISOString(),
  }).eq("id", leaveId);

  if (approve && lv.type === "loa") {
    await sb.from("score_logs").insert({
      member_id: lv.member_id,
      delta: SCORE_RULES.loa_taken,
      reason: `ลาตามแจ้ง (${lv.start_date} → ${lv.end_date})`,
    });
  }
  revalidatePath("/admin");
  revalidatePath("/leave");
}
