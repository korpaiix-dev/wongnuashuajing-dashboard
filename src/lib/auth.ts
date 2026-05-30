import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { adminClient } from "./supabase";
import type { Persona, Rank } from "./types";

declare module "next-auth" {
  interface Session {
    discordId: string;
    persona: Persona;
    rank?: Rank;
    memberId?: string;
    displayName?: string;
    avatarUrl?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    discordId?: string;
    discordUsername?: string;
    discordAvatar?: string | null;
    persona?: Persona;
    rank?: Rank;
    memberId?: string;
    displayName?: string;
    avatarUrl?: string | null;
    lastRefresh?: number;
  }
}

const REFRESH_INTERVAL = 60_000; // 1 นาที — re-check persona ถ้า JWT เก่ากว่านี้

async function lookupPersona(discordId: string, discordUsername: string, avatarHash: string | null) {
  const sb = adminClient();
  const avatarUrl = avatarHash
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`
    : null;

  // 1 query — get profile + member if exists (left join)
  await sb.from("profiles").upsert(
    { discord_user_id: discordId, discord_username: discordUsername, avatar_url: avatarUrl },
    { onConflict: "discord_user_id" }
  );

  const { data: m } = await sb
    .from("members")
    .select("id, name, rank, status, profiles!inner(discord_user_id, avatar_url)")
    .eq("profiles.discord_user_id", discordId)
    .maybeSingle();

  if (m && m.status !== "kicked") {
    const rank = m.rank as Rank;
    const profileRow = (m as unknown as { profiles?: { avatar_url?: string | null } }).profiles;
    return {
      persona: (rank === "boss" ? "boss" : rank === "admin" ? "admin" : "member") as Persona,
      rank,
      memberId: m.id as string,
      displayName: m.name as string,
      avatarUrl: profileRow?.avatar_url ?? avatarUrl,
    };
  }

  return {
    persona: "applicant" as Persona,
    rank: undefined,
    memberId: undefined,
    displayName: discordUsername,
    avatarUrl,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account, trigger }) {
      // ตอน login ครั้งแรก — grab Discord info
      if (account && profile) {
        token.discordId = (profile as { id?: string }).id ?? token.sub ?? "";
        token.discordUsername = (profile as { username?: string }).username ?? "discord-user";
        token.discordAvatar = (profile as { avatar?: string }).avatar ?? null;
        token.lastRefresh = 0; // force refresh
      }

      const needsRefresh =
        !token.persona ||
        trigger === "update" ||
        (token.lastRefresh && Date.now() - token.lastRefresh > REFRESH_INTERVAL);

      if (needsRefresh && token.discordId && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const data = await lookupPersona(
            token.discordId,
            (token.discordUsername as string) || "discord-user",
            (token.discordAvatar as string | null) ?? null
          );
          token.persona = data.persona;
          token.rank = data.rank;
          token.memberId = data.memberId;
          token.displayName = data.displayName;
          token.avatarUrl = data.avatarUrl;
          token.lastRefresh = Date.now();
        } catch (e) {
          console.error("[auth.jwt] lookup error", e);
          // คง persona เดิม (ไม่ downgrade Boss → applicant)
          if (!token.persona) token.persona = "applicant";
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Pure copy — NO DB hits
      session.discordId = (token.discordId as string) || "";
      session.persona = (token.persona as Persona) ?? "applicant";
      session.rank = token.rank as Rank | undefined;
      session.memberId = token.memberId as string | undefined;
      session.displayName = (token.displayName as string) || session.discordId;
      session.avatarUrl = (token.avatarUrl as string | null) ?? null;
      return session;
    },
  },
  pages: { signIn: "/" },
});
