import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { addBalanceXP } from "../../../../helpers/accountManager";
import { ResultEmbed } from "../roulette";

export const dozenSubcommand = new SlashCommandSubcommandBuilder()
  .setName("dozen")
  .setDescription("Play a dozen, pay 2x")
  .addNumberOption((options) =>
    options
      .setName("bet")
      .setRequired(true)
      .setDescription("The amount of chips you want to bet"),
  )
  .addNumberOption((options) =>
    options
      .setName("guess")
      .setRequired(true)
      .setDescription("The dozen you want to bet on")
      .addChoices([
        ["1-12", 1],
        ["13-24", 2],
        ["25-36", 3],
      ]),
  );

export const dozenRun = (
  interaction: CommandInteraction,
  bet: number,
  rndNumber: number,
) => {
  const guess = interaction.options.getNumber("guess") || 0;
  if (rndNumber === 0) {
    interaction.editReply({
      embeds: [
        ResultEmbed(
          "lose",
          rndNumber,
          `${["1-12", "13-24", "25-36"][guess - 1]}`,
          bet,
          -bet,
        ),
      ],
    });
    return;
  }
  const result = Math.ceil(rndNumber / 12) === guess;
  if (result) {
    addBalanceXP(interaction.user.id, bet * 3, bet * 2);

    interaction.editReply({
      embeds: [
        ResultEmbed(
          "win",
          rndNumber,
          `${["1-12", "13-24", "25-36"][guess - 1]}`,
          bet,
          bet * 2,
        ),
      ],
    });
  } else {
    interaction.editReply({
      embeds: [
        ResultEmbed(
          "lose",
          rndNumber,
          `${["1-12", "13-24", "25-36"][guess - 1]}`,
          bet,
          -bet,
        ),
      ],
    });
  }
};
