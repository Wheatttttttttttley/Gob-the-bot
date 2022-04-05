import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { warningEmbed } from "../../helpers/warningHandler";
import playerModel from "../../models/playerModel";

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
  .addBooleanOption((option) => option.setName("full").setRequired(false).setDescription("Show full list of players"));

async function run(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply();

  const isFull = interaction.options.getBoolean("full") ?? false;
  const sortBy = interaction.options.getString("sort-by") ?? "balance";

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
      const playersToShow = await Promise.all(
        players.slice(0, isFull ? players.length : 5).map(async (player, _) => {
          try {
            const member = await interaction.guild?.members.fetch(player._id);
            return {
              username: member?.user?.username,
              balance: player.balance,
              level: player.level,
            };
          } catch {
            return {
              username: undefined,
              balance: player.balance,
              level: player.level,
            };
          }
        }),
      );

      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("🏆 Leaderboard 🏆")
            .setColor(0x00ae86)
            .setDescription(`Top Players`)
            .addField("Players 😎", playersToShow.map((player, i) => `${i + 1}. ${player.username}`).join("\n"), true)
            .addField(
              "Balance 💵",
              playersToShow
                .map(
                  (player, _) =>
                    `${
                      player.balance > 1000000
                        ? `${(player.balance / 1000000).toFixed(1)}M`
                        : player.balance > 1000
                        ? `${(player.balance / 1000).toFixed(1)}K`
                        : player.balance
                    }`,
                )
                .join("\n"),
              true,
            )
            .addField("Level 🌟", playersToShow.map((player, _) => `${player.level}`).join("\n"), true),
        ],
      });
    });

  return;
}

export default {
  data,
  run,
};
