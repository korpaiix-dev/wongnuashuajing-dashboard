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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      if (account && profile) {
        token.discordId = (profile as { id?: string }).id ?? token.sub ?? "";
        token.discordUsername = (profile as { username?: string }).username ?? "";
        token.discordAvatar = (profile as { avatar?: string }).avatar ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      const discordId = (token.discordId as string) || token.sub || "";
      session.discordId = discordId;
      session.persona = "guest";

      // Look up persona from Supabase (only if env is set)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const sb = adminClient();
          // upsert profile
          const username = (token.discordUsername as string) || "discord-user";
          const avatarHash = token.discordAvatar as string | null;
          const avatarUrl = avatarHash
            ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`
            : null;
          await sb.from("profiles").upsert(
            { discord_user_id: discordId, discord_username: username, avatar_url: avatarUrl },
            { onConflict: "discord_user_id" }
          );

          // join member?
          const { data: m } = await sb
            .from("members")
            .select("id, name, rank, status, profile_id, profiles!inner(discord_user_id, avatar_url)")
            .eq("profiles.discord_user_id", discordId)
            .maybeSingle();

          if (m) {
            session.persona = m.rank === "boss" ? "boss" : m.rank === "admin" ? "admin" : "member";
            session.rank = m.rank as Rank;
            session.memberId = m.id;
            session.displayName = m.name;
            session.avatarUrl = (m as { profiles?: { avatar_url?: string | null } }).profiles?.avatar_url ?? null;
          } else {
            // any application?
            const { data: app } = await sb
              .from("applications")
              .select("status, display_name")
              .eq("profile_id", (await sb.from("profiles").select("id").eq("discord_user_id", discordId).maybeSingle()).data?.id ?? "")
              .maybeSingle();
            if (app && app.status !== "rejected") {
              session.persona = "applicant";
              session.displayName = app.display_name;
            } else {
              session.persona = "applicant"; // logged in but not member yet — apply form
              session.displayName = username;
            }
            session.avatarUrl = avatarUrl;
          }
        } catch {
          // DB not ready — fall through to guest/applicant
          session.persona = "applicant";
        }
      } else {
        // no DB configured yet
        session.persona = "applicant";
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
