import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import playerModel from "../../models/playerModel";
import { warningEmbed } from "../../helpers/warningHandler";

const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("See the leaderboard!");

async function run(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply();
  playerModel
    .find({})
    .sort({ balance: -1 })
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
      const playersInGuild = await Promise.all(
        players.map(async (player) => {
          try {
            const member = await interaction.guild?.members.fetch(player._id);
            return {
              user: member?.user,
              balance: player.balance,
            };
          } catch {
            return;
          }
        }),
      );
      const playersInGuildFiltered = playersInGuild
        .filter((player) => player)
        .splice(0, 5);
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("🏆 Leaderboard 🏆")
            .setColor(0x00ae86)
            .setFooter("Top 5 players in this guild")
            .setDescription(
              playersInGuildFiltered
                .map(
                  (player, index) =>
                    `${index + 1}. **${player?.user?.username}** ${
                      player?.balance
                    } 💵`,
                )
                .join("\n"),
            ),
        ],
      });
    });
}

export default {
  data,
  run,
};
