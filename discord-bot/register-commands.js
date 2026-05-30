import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("ดูอันดับคะแนนประจำเดือน"),
  new SlashCommandBuilder()
    .setName("upcoming")
    .setDescription("ดูกิจกรรมที่กำลังจะมา"),
].map((c) => c.toJSON());

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
  { body: commands }
);
console.log("✅ Slash commands registered");
