import "dotenv/config";
import { Client, GatewayIntentBits, Events, EmbedBuilder } from "discord.js";
import { createClient } from "@supabase/supabase-js";
import cron from "node-cron";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

// Handle button interactions (RSVP)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  const [action, choice, eventId] = interaction.customId.split(":");
  if (action !== "rsvp") return;

  const discordId = interaction.user.id;
  const { data: profile } = await sb.from("profiles").select("id").eq("discord_user_id", discordId).maybeSingle();
  if (!profile) return interaction.reply({ content: "❌ ยังไม่ได้ login กับเว็บ", ephemeral: true });

  const { data: member } = await sb.from("members").select("id, name").eq("profile_id", profile.id).maybeSingle();
  if (!member) return interaction.reply({ content: "❌ คุณยังไม่ใช่สมาชิก", ephemeral: true });

  await sb.from("event_rsvp").upsert({
    event_id: eventId,
    member_id: member.id,
    response: choice,
    responded_at: new Date().toISOString(),
  });

  await interaction.reply({
    content: choice === "yes" ? `✅ ${member.name} ตอบรับ` : `❌ ${member.name} ไม่เข้าร่วม`,
    ephemeral: true,
  });
});

// Daily scheduler — runs every minute, checks schedules table
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const hhmm = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dow = now.getDay(); // 0..6

  const { data: schedules } = await sb.from("schedules").select("*").eq("active", true);
  for (const s of schedules ?? []) {
    if (s.time_of_day !== hhmm) continue;
    if (!(s.days_of_week ?? []).includes(dow)) continue;
    const channel = await client.channels.fetch(s.channel_id).catch(() => null);
    if (channel?.isTextBased()) {
      await channel.send({
        embeds: [new EmbedBuilder().setColor(0xd4af37).setTitle(`🔔 ${s.title}`).setDescription(s.message)],
      });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
