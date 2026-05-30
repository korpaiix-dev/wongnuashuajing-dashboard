"use server";
import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { invalidateScoreRulesCache } from "@/lib/score-rules";

const SCORE_KEYS = [
  "airdrop_join", "story_join", "story_win_bonus",
  "meeting_join", "training_join", "mvp_bonus",
  "absent_no_notice", "loa_taken", "overstay_per_day", "overstay_max_days"
] as const;

export async function updateScoreSettings(formData: FormData) {
  const session = await auth();
  if (!session || session.persona !== "boss") return;

  const sb = adminClient();
  const updates: { key: string; value: string }[] = [];
  for (const k of SCORE_KEYS) {
    const raw = formData.get(k);
    if (raw == null) continue;
    const n = Number(raw);
    if (Number.isNaN(n)) continue;
    if (k === "overstay_max_days" && n < 1) continue;
    updates.push({ key: `score_${k}`, value: String(n) });
  }
  if (updates.length === 0) return;
  await sb.from("app_settings").upsert(updates);

  await sb.from("audit_logs").insert({
    actor_id: session.memberId ?? null,
    action: "update_score_settings",
    target: "SCORE_RULES",
    detail: updates.map((u) => `${u.key}=${u.value}`).join(", "),
  });

  invalidateScoreRulesCache();
  revalidatePath("/admin/settings");
}
