import "server-only";
import { adminClient } from "./supabase";
import { SCORE_RULES } from "./types";

export type ScoreRules = Record<keyof typeof SCORE_RULES, number> & {
  overstay_per_day: number;
  overstay_max_days: number;
};

const DEFAULT_EXTRAS = { overstay_per_day: -10, overstay_max_days: 7 };

let cache: { value: ScoreRules; expiresAt: number } | null = null;
const TTL = 60_000; // 1 นาที — admin แก้ค่าใหม่ใช้ได้ใน 60s

export async function getScoreRules(): Promise<ScoreRules> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  const merged: ScoreRules = { ...SCORE_RULES, ...DEFAULT_EXTRAS };
  try {
    const sb = adminClient();
    const { data } = await sb.from("app_settings").select("key, value").like("key", "score_%");
    for (const row of data ?? []) {
      const key = row.key.replace(/^score_/, "") as keyof ScoreRules;
      const n = Number(row.value);
      if (!Number.isNaN(n)) (merged as Record<string, number>)[key] = n;
    }
  } catch (e) {
    console.error("[getScoreRules] fallback to defaults", e);
  }

  cache = { value: merged, expiresAt: Date.now() + TTL };
  return merged;
}

export function invalidateScoreRulesCache() {
  cache = null;
}
