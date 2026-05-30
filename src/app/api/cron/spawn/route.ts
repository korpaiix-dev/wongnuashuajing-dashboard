import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

const TZ = "Asia/Bangkok";

function thaiNow() {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const hh = parts.find((p) => p.type === "hour")!.value;
  const mm = parts.find((p) => p.type === "minute")!.value;
  const wdShort = parts.find((p) => p.type === "weekday")!.value;
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { hhmm: `${hh}:${mm}`, dow: wdMap[wdShort] ?? new Date().getDay() };
}

async function discordBroadcast(eventId: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return;
  const sb = adminClient();
  const { data: ev } = await sb.from("events").select("*").eq("id", eventId).maybeSingle();
  if (!ev) return;

  const channelMap: Record<string, string | undefined> = {
    story:   process.env.DISCORD_STORY_CHANNEL_ID,
    war:     process.env.DISCORD_STORY_CHANNEL_ID,
    airdrop: process.env.DISCORD_AIRDROP_CHANNEL_ID,
  };
  const channel = channelMap[ev.type as string] ?? process.env.DISCORD_ANNOUNCE_CHANNEL_ID;
  if (!channel) return;

  const when = new Date(ev.when_at).toLocaleString("th-TH", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" });
  const embed = {
    color: 0xd4af37,
    title: `🎯 ${ev.title}`,
    description: ev.notes || undefined,
    fields: [
      { name: "ประเภท", value: String(ev.type).toUpperCase(), inline: true },
      { name: "เวลา", value: when, inline: true },
      ev.location ? { name: "สถานที่", value: ev.location, inline: true } : null,
      ev.enemy_gang ? { name: "คู่ต่อสู้", value: ev.enemy_gang, inline: true } : null,
      { name: "คะแนนเข้าร่วม", value: `+${ev.points_reward}`, inline: true },
    ].filter(Boolean),
    footer: { text: "Wongnuashuajing Gang OS · Recurring" },
  };
  const components = [{
    type: 1,
    components: [
      { type: 2, style: 3, label: "✅ เข้าร่วม", custom_id: `rsvp:yes:${eventId}` },
      { type: 2, style: 4, label: "❌ ไม่เข้าร่วม", custom_id: `rsvp:no:${eventId}` },
    ],
  }];
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

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return new NextResponse("missing token", { status: 401 });

  const sb = adminClient();
  const { data: secretRow } = await sb.from("app_settings").select("value").eq("key", "cron_secret").maybeSingle();
  if (!secretRow || secretRow.value !== token) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const { hhmm, dow } = thaiNow();

  // Fetch active templates
  const { data: templates } = await sb
    .from("event_templates")
    .select("*")
    .eq("active", true);

  const spawned: { id: string; title: string; time: string }[] = [];
  for (const t of templates ?? []) {
    const times: string[] = t.times_of_day ?? [];
    const days: number[] = t.days_of_week ?? [];
    if (!times.includes(hhmm)) continue;
    if (!days.includes(dow)) continue;

    // Idempotency: skip if spawned in last 5 min
    if (t.last_spawned_at) {
      const ago = Date.now() - new Date(t.last_spawned_at).getTime();
      if (ago < 5 * 60 * 1000) continue;
    }

    // Create event row at "now" (Bangkok timezone)
    const whenIso = new Date().toISOString();
    const { data: ev } = await sb.from("events").insert({
      type: t.type,
      title: t.title,
      when_at: whenIso,
      location: t.location,
      enemy_gang: t.enemy_gang,
      notes: t.notes,
      points_reward: t.points_reward,
      status: "open",
      created_by: t.created_by ?? null,
    }).select("id, title").single();
    if (!ev) continue;

    await sb.from("event_templates").update({ last_spawned_at: whenIso }).eq("id", t.id);
    await discordBroadcast(ev.id);
    spawned.push({ id: ev.id, title: ev.title, time: hhmm });
  }

  return NextResponse.json({ ok: true, hhmm, dow, checked: (templates ?? []).length, spawned });
}

// Also allow GET for quick manual test (admin in browser)
export async function GET(req: Request) {
  return POST(req);
}

export const runtime = "nodejs";
