"use server";
import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { Rank } from "@/lib/types";

export async function updateMemberRank(memberId: string, rank: Rank) {
  const session = await auth();
  if (!session || session.persona !== "boss") return;
  const sb = adminClient();
  await sb.from("members").update({ rank, updated_at: new Date().toISOString() }).eq("id", memberId);
  revalidatePath("/admin/members");
  revalidatePath("/roster");
}

export async function kickMember(memberId: string) {
  const session = await auth();
  if (!session || session.persona !== "boss") return;
  const sb = adminClient();
  await sb.from("members").update({ status: "kicked", updated_at: new Date().toISOString() }).eq("id", memberId);
  revalidatePath("/admin/members");
}

export async function updateMemberRankForm(formData: FormData) {
  const memberId = String(formData.get("member_id") ?? "");
  const rank = String(formData.get("rank") ?? "");
  if (!memberId || !["member","admin","boss"].includes(rank)) return;
  return updateMemberRank(memberId, rank as "boss"|"admin"|"member");
}

export async function kickMemberForm(formData: FormData) {
  const memberId = String(formData.get("member_id") ?? "");
  if (!memberId) return;
  return kickMember(memberId);
}
