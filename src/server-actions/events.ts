"use server";
import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { SCORE_RULES, type EventType } from "@/lib/types";

const TYPE_DEFAULT_POINTS: Record<EventType, number> = {
  airdrop: SCORE_RULES.airdrop_join,
  story: SCORE_RULES.story_join,
  war: SCORE_RULES.story_join,
  meeting: SCORE_RULES.meeting_join,
  training: SCORE_RULES.training_join,
};

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session || (session.persona !== "admin" && session.persona !== "boss")) return;

  const type = String(formData.get("type") ?? "story") as EventType;
  const title = String(formData.get("title") ?? "").trim().slice(0, 100);
  const when_at = String(formData.get("when_at") ?? "");
  const location = String(formData.get("location") ?? "").trim().slice(0, 200) || null;
  const enemy_gang = String(formData.get("enemy_gang") ?? "").trim().slice(0, 80) || null;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;
  const broadcast = formData.get("broadcast") === "on";
  const points_reward = Number(formData.get("points_reward") || TYPE_DEFAULT_POINTS[type] || 10);
  if (!title || !when_at) return;

  const sb = adminClient();
  const { data: ev } = await sb.from("events").insert({
    type, title, when_at, location, enemy_gang, notes, points_reward,
    created_by: session.memberId ?? null,
  }).select("id").single();

  if (broadcast && ev) {
    await broadcastEvent(ev.id);
  }
  revalidatePath("/events");
  revalidatePath("/admin");
}

export async function rsvp(eventId: string, response: "yes" | "no") {
  const session = await auth();
  if (!session?.memberId) return;
  const sb = adminClient();
  await sb.from("event_rsvp").upsert({
    event_id: eventId, member_id: session.memberId, response, responded_at: new Date().toISOString(),
  });
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

export async function broadcastEvent(eventId: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channel = process.env.DISCORD_ANNOUNCE_CHANNEL_ID;
  if (!token || !channel) return;
  const sb = adminClient();
  const { data: ev } = await sb.from("events").select("*").eq("id", eventId).maybeSingle();
  if (!ev) return;

  const when = new Date(ev.when_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
  const embed = {
    color: 0xd4af37,
    title: `🎯 ${ev.title}`,
    description: ev.notes || undefined,
    fields: [
      { name: "ประเภท", value: ev.type.toUpperCase(), inline: true },
      { name: "เวลา", value: when, inline: true },
      ev.location ? { name: "สถานที่", value: ev.location, inline: true } : null,
      ev.enemy_gang ? { name: "คู่ต่อสู้", value: ev.enemy_gang, inline: true } : null,
      { name: "คะแนนเข้าร่วม", value: `+${ev.points_reward}`, inline: true },
    ].filter(Boolean),
    footer: { text: "Wongnuashuajing Gang OS" },
  };
  const components = [
    {
      type: 1,
      components: [
        { type: 2, style: 3, label: "✅ เข้าร่วม", custom_id: `rsvp:yes:${eventId}` },
        { type: 2, style: 4, label: "❌ ไม่เข้าร่วม", custom_id: `rsvp:no:${eventId}` },
      ],
    },
  ];

  const res = await fetch(`https://discord.com/api/v10/channels/${channel}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed], components }),
  });
  if (res.ok) {
    const msg = await res.json();
    await sb.from("events").update({ discord_message_id: msg.id }).eq("id", eventId);
  }
}

export async function submitEventResult(eventId: string, formData: FormData) {
  const session = await auth();
  if (!session || (session.persona !== "admin" && session.persona !== "boss")) return;

  const outcome = formData.get("outcome") as "win" | "loss" | "draw" | null;
  const our_score = formData.get("our_score") ? Number(formData.get("our_score")) : null;
  const their_score = formData.get("their_score") ? Number(formData.get("their_score")) : null;
  const mvp_member_id = (formData.get("mvp_member_id") as string) || null;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;
  const attended = formData.getAll("attended").map(String); // member ids

  const sb = adminClient();
  await sb.from("event_results").upsert({
    event_id: eventId, outcome, our_score, their_score, mvp_member_id, notes,
    scored_at: new Date().toISOString(),
  });
  await sb.from("events").update({ status: "done" }).eq("id", eventId);

  const { data: ev } = await sb.from("events").select("type, points_reward, title").eq("id", eventId).maybeSingle();
  if (!ev) return;

  // คะแนนเข้าร่วม
  for (const mid of attended) {
    let delta = ev.points_reward;
    if ((ev.type === "story" || ev.type === "war") && outcome === "win") delta += SCORE_RULES.story_win_bonus;
    await sb.from("score_logs").insert({
      member_id: mid, event_id: eventId, delta,
      reason: `เข้าร่วม ${ev.title}${outcome === "win" ? " (ชนะ)" : ""}`,
    });
  }
  // MVP bonus
  if (mvp_member_id) {
    await sb.from("score_logs").insert({
      member_id: mvp_member_id, event_id: eventId, delta: SCORE_RULES.mvp_bonus,
      reason: `MVP: ${ev.title}`,
    });
  }
  revalidatePath("/ranking");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin");
}
