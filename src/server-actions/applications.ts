"use server";
import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Rank } from "@/lib/types";

export async function submitApplication(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/");
  if (session.persona !== "applicant" && session.persona !== "guest") return;

  const display_name = String(formData.get("display_name") ?? "").trim().slice(0, 40);
  const available_time = String(formData.get("available_time") ?? "").trim().slice(0, 120);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!display_name || !reason) return;

  const sb = adminClient();
  const { data: profile } = await sb
    .from("profiles")
    .select("id")
    .eq("discord_user_id", session.discordId)
    .maybeSingle();
  if (!profile) return;

  await sb.from("applications").upsert(
    { profile_id: profile.id, display_name, available_time, reason, status: "pending" },
    { onConflict: "profile_id" }
  );

  await notifyAdminChannel({
    title: "ใบสมัครใหม่",
    description: `**${display_name}** ส่งใบสมัครเข้าแก๊ง\n\n_${reason}_`,
    fields: [{ name: "เวลาที่เล่นได้", value: available_time || "ไม่ระบุ" }],
  });

  revalidatePath("/apply");
}

// Single form handler — reads action + applicationId + rank from FormData
export async function reviewApplication(formData: FormData) {
  const session = await auth();
  if (!session || (session.persona !== "admin" && session.persona !== "boss")) return;

  const applicationId = String(formData.get("application_id") ?? "");
  const verdict = String(formData.get("verdict") ?? "");
  const rank = (String(formData.get("rank") ?? "member") as Rank);
  if (!applicationId) return;

  const sb = adminClient();
  const { data: app, error: appErr } = await sb
    .from("applications")
    .select("id, profile_id, display_name, status")
    .eq("id", applicationId)
    .maybeSingle();
  if (appErr) { console.error("[review] fetch err", appErr); return; }
  if (!app) { console.error("[review] app not found", applicationId); return; }
  if (app.status !== "pending") { console.warn("[review] not pending", app.status); return; }

  if (verdict === "approve") {
    // Insert member (allow Boss to choose Member / Admin / Boss)
    const { error: insErr } = await sb.from("members").insert({
      profile_id: app.profile_id,
      name: app.display_name,
      rank,
      status: "active",
    });
    if (insErr) { console.error("[review] member insert err", insErr); return; }

    const { error: updErr } = await sb
      .from("applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", applicationId);
    if (updErr) console.error("[review] app update err", updErr);

    await sb.from("audit_logs").insert({
      actor_id: session.memberId ?? null,
      action: "approve_applicant",
      target: app.display_name,
      detail: `rank=${rank}`,
    });
  } else if (verdict === "reject") {
    await sb
      .from("applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", applicationId);
    await sb.from("audit_logs").insert({
      actor_id: session.memberId ?? null,
      action: "reject_applicant",
      target: app.display_name,
    });
  }

  revalidatePath("/admin/applicants");
  revalidatePath("/admin/members");
  revalidatePath("/admin");
  revalidatePath("/roster");
}

async function notifyAdminChannel(embed: {
  title: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
}) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channel = process.env.DISCORD_ADMIN_CHANNEL_ID;
  if (!token || !channel) return;
  await fetch(`https://discord.com/api/v10/channels/${channel}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [{ color: 0xd4af37, ...embed }] }),
  }).catch(() => {});
}
