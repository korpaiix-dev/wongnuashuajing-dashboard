"use server";
import { auth } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { EventType } from "@/lib/types";

function parseTimes(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(s))
    .map((s) => (s.length === 4 ? "0" + s : s));   // "9:00" → "09:00"
}

function parseDays(formData: FormData): number[] {
  const all = formData.getAll("days").map((v) => Number(v)).filter((n) => n >= 0 && n <= 6);
  return all.length ? all : [0, 1, 2, 3, 4, 5, 6];
}

export async function createTemplate(formData: FormData) {
  const session = await auth();
  if (!session || (session.persona !== "boss" && session.persona !== "admin")) return;

  const type = (String(formData.get("type") ?? "airdrop") as EventType);
  const title = String(formData.get("title") ?? "").trim().slice(0, 100);
  const times = parseTimes(String(formData.get("times") ?? ""));
  const days = parseDays(formData);
  const location = String(formData.get("location") ?? "").trim().slice(0, 200) || null;
  const enemy_gang = String(formData.get("enemy_gang") ?? "").trim().slice(0, 80) || null;
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;
  const points_reward = Number(formData.get("points_reward") || 10);
  if (!title || times.length === 0) return;

  const sb = adminClient();
  await sb.from("event_templates").insert({
    type, title, times_of_day: times, days_of_week: days,
    location, enemy_gang, notes, points_reward,
    active: true,
    created_by: session.memberId ?? null,
  });
  revalidatePath("/admin/schedule");
}

export async function toggleTemplate(formData: FormData) {
  const session = await auth();
  if (!session || (session.persona !== "boss" && session.persona !== "admin")) return;
  const id = String(formData.get("template_id") ?? "");
  const active = String(formData.get("active")) === "true";
  if (!id) return;
  const sb = adminClient();
  await sb.from("event_templates").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/schedule");
}

export async function deleteTemplate(formData: FormData) {
  const session = await auth();
  if (!session || session.persona !== "boss") return;
  const id = String(formData.get("template_id") ?? "");
  if (!id) return;
  const sb = adminClient();
  await sb.from("event_templates").delete().eq("id", id);
  revalidatePath("/admin/schedule");
}
