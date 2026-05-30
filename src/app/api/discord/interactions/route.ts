import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";

// Verify Discord ed25519 signature (Discord requires this)
async function verifyDiscord(body: string, signature: string, timestamp: string, publicKey: string) {
  try {
    const enc = (s: string) => new Uint8Array(s.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    const msg = new TextEncoder().encode(timestamp + body);
    const sigBytes = enc(signature);
    const keyBytes = enc(publicKey);
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify("Ed25519", key, sigBytes, msg);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("x-signature-ed25519");
  const ts = req.headers.get("x-signature-timestamp");
  const pubKey = process.env.DISCORD_PUBLIC_KEY;

  if (!sig || !ts || !pubKey) return new NextResponse("missing signature", { status: 401 });
  if (!(await verifyDiscord(body, sig, ts, pubKey))) {
    return new NextResponse("bad signature", { status: 401 });
  }

  const data = JSON.parse(body);

  // PING from Discord
  if (data.type === 1) return NextResponse.json({ type: 1 });

  // Button click: custom_id format = "rsvp:yes:<eventId>" or "rsvp:no:<eventId>"
  if (data.type === 3) {
    const customId = data.data?.custom_id as string;
    const discordUserId = data.member?.user?.id ?? data.user?.id;
    const [action, choice, eventId] = customId.split(":");

    if (action === "rsvp" && (choice === "yes" || choice === "no") && eventId) {
      const sb = adminClient();
      const { data: profile } = await sb.from("profiles").select("id").eq("discord_user_id", discordUserId).maybeSingle();
      if (!profile) {
        return NextResponse.json({
          type: 4,
          data: { content: "❌ คุณยังไม่ได้ login กับเว็บ — เข้าเว็บก่อนหนึ่งครั้งเพื่อ link Discord", flags: 64 },
        });
      }
      const { data: member } = await sb.from("members").select("id, name").eq("profile_id", profile.id).maybeSingle();
      if (!member) {
        return NextResponse.json({
          type: 4,
          data: { content: "❌ คุณยังไม่ใช่สมาชิกแก๊ง", flags: 64 },
        });
      }
      await sb.from("event_rsvp").upsert({
        event_id: eventId, member_id: member.id,
        response: choice, responded_at: new Date().toISOString(),
      });
      return NextResponse.json({
        type: 4,
        data: { content: choice === "yes" ? `✅ ${member.name} ตอบรับเรียบร้อย` : `❌ ${member.name} แจ้งไม่เข้าร่วม`, flags: 64 },
      });
    }
  }

  return NextResponse.json({ type: 4, data: { content: "ไม่รู้จัก action นี้", flags: 64 } });
}

export const runtime = "nodejs";
