import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { addBalance } from "../../helpers/accountManager";
import { warningEmbed } from "../../helpers/warningHandler";
import playerModel from "../../models/playerModel";

const data = new SlashCommandBuilder()
  .setName("addall")
  .setDescription("Add balance to all players")
  .addNumberOption((options) =>
    options
      .setName("amount")
      .setDescription("Amount to add to all players")
      .setRequired(true),
  );

const run = async (interaction: CommandInteraction): Promise<void> => {
  await interaction.deferReply();

  const amount = interaction.options.getNumber("amount") ?? 0;

  playerModel.find({}).exec(async (err, players) => {
    if (err) {
      await interaction.editReply(
        warningEmbed({
          title: "ERROR",
          description: err as unknown as string,
        }),
      );
      return;
    }
    players.map((player, _) => addBalance(player._id, amount));

    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle("💸 Balance Added 💸")
          .setDescription(
            `Everyone's balance has been added by **${interaction.user.username}**`,
          )
          .addField("Amount", `**💵 : ${amount}**`)
          .setColor(0x57f287),
      ],
    });
  });
};

export default {
  data,
  ownerOnly: true,
  run,
};
