import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import playerModel from "../../models/playerModel";
import { warningEmbed } from "../../helpers/warningHandler";

const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("See the leaderboard!")
  .addStringOption((option) =>
    option
      .setName("sort-by")
      .setRequired(false)
      .setDescription("sort by balance or level")
      .addChoice("balance", "balance")
      .addChoice("level", "level"),
  )
  .addBooleanOption((option) =>
    option
      .setName("full")
      .setRequired(false)
      .setDescription("Show full list of players"),
  );

async function run(interaction: CommandInteraction): Promise<void> {
  const isFull = interaction.options.getBoolean("full") ?? false;
  const sortBy = interaction.options.getString("sort-by") ?? "balance";
  await interaction.deferReply();
  playerModel
    .find({})
    .sort(sortBy === "balance" ? { balance: -1 } : { level: -1 })
    .exec(async (err, players) => {
      if (err) {
        await interaction.editReply(
          warningEmbed({
            title: "ERROR",
            description: err as unknown as string,
          }),
        );
        return;
      }
      const playersToShow = isFull ? players : players.slice(0, 5);
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("🏆 Leaderboard 🏆")
            .setColor(0x00ae86)
            .setDescription(`Top Players`)
            .addField(
              "Players 😎",
              playersToShow
                .map((player, i) => `${i + 1}. **${player?.user?.username}**`)
                .join("\n"),
              true,
            )
            .addField(
              "Balance 💵",
              playersToShow.map((player, _) => `${player?.balance}`).join("\n"),
              true,
            )
            .addField(
              "Level 🌟",
              playersToShow.map((player, _) => `${player?.level}`).join("\n"),
              true,
            ),
        ],
      });
    });
}

export default {
  data,
  run,
};
